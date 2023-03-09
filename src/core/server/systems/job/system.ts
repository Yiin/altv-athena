import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api';

import { Objective, ObjectiveEvents } from '@AthenaShared/interfaces/job';
import { deepCloneObject } from '@AthenaShared/utility/deepCopy';

export function cloneObjective(objectiveData: Objective): Objective {
    const callbackOnStart = objectiveData.callbackOnStart;
    const callbackOnFinish = objectiveData.callbackOnFinish;
    const callbackOnCheck = objectiveData.callbackOnCheck;
    const objectiveClone = deepCloneObject<Objective>(objectiveData);
    objectiveClone.callbackOnStart = callbackOnStart;
    objectiveClone.callbackOnFinish = callbackOnFinish;
    objectiveClone.callbackOnCheck = callbackOnCheck;
    return objectiveClone;
}

/**
 * Create a Job Instance
 *
 * A job can be specified as a series of tasks to complete with specific criteria.
 *
 * ie. Go to this location, interact with this thing, ensure you have this item, etc.
 *
 * @export
 * @class Job
 */
export class Job {
    /**
     * The ID of the player.
     * @private
     * @type {number}
     * @memberof Job
     */
    private id: number;
    private player: alt.Player;
    private objectives: Array<Objective> = [];
    private vehicles: Array<{ uid: string; vehicle: alt.Vehicle }> = [];
    private startTime: number;
    private completedCallback: (job: Job) => Promise<void>;
    private quitCallback: (job: Job, reason: string) => void;

    /**
     * Creates an instance of a job handler.
     * Used to build a Job for usage.
     * This instance should be called each time to create new job instances.
     * @memberof Job
     */
    constructor() {}

    /**
     * Add the player to the job this job and start it.
     * Ensure that this Job is initialized with new Job first.
     * @param {alt.Player} player
     * @memberof Job
     */
    addPlayer(player: alt.Player) {
        this.player = player;
        this.id = this.player.id;
        Athena.systems.job.instance.set(this.player, this);
        this.startTime = Date.now();
        this.syncObjective();
    }

    /**
     * Add an objective to this job.
     * Use the objective interface to generate the objective information.
     * @param {Objective} objectiveData
     * @memberof Job
     */
    addObjective(objectiveData: Objective) {
        const objectiveClone = cloneObjective(objectiveData);
        this.objectives.push(objectiveClone);
    }

    /**
     * Create a unique vehicle for this job.
     * Objective eventually removes the job vehicle.
     * This unique job vehicle is temporarily assinged to the player.
     *
     * Returns a vehicle with a 'uid'.
     *
     * @memberof Job
     */
    addVehicle(
        player: alt.Player,
        model: string | number,
        pos: alt.IVector3,
        rot: alt.IVector3,
        color1?: alt.RGBA,
        color2?: alt.RGBA,
    ): alt.Vehicle {
        const veh = Athena.vehicle.spawn.temporaryOwned(player, { model: model, pos, rot }, false);
        const data = Athena.document.character.get(player);

        if (!color1) {
            color1 = new alt.RGBA(255, 255, 255, 255);
        }

        if (!color2) {
            color2 = new alt.RGBA(255, 255, 255, 255);
        }

        veh.customPrimaryColor = color1;
        veh.customSecondaryColor = color2;
        this.vehicles.push({ vehicle: veh, uid: Athena.utility.hash.sha256Random(JSON.stringify(data)) });
        return veh;
    }

    /**
     * Remove all vehicles from this job.
     * @memberof Job
     */
    removeAllVehicles() {
        for (let i = 0; i < this.vehicles.length; i++) {
            try {
                this.vehicles[i].vehicle.destroy();
            } catch (err) {}
        }
    }

    /**
     * Remove a vehicle by unique identifier assigned when adding a vehicle.
     * @param {string} uid
     * @return {*}
     * @memberof Job
     */
    removeVehicle(uid: string) {
        for (let i = this.vehicles.length - 1; i >= 0; i--) {
            if (this.vehicles[i].uid !== uid) {
                continue;
            }

            try {
                this.vehicles[i].vehicle.destroy();
            } catch (err) {}

            this.vehicles.splice(i, 1);
            return;
        }
    }

    /**
     * Appends a list of objectives into the Job Framework.
     * @param {Objective} objectiveData
     * @memberof Job
     */
    loadObjectives(objectiveData: Array<Objective>) {
        const uniqueObjectives = [];

        for (let i = 0; i < objectiveData.length; i++) {
            const callbackOnStart = objectiveData[i].callbackOnStart;
            const callbackOnFinish = objectiveData[i].callbackOnFinish;
            const callbackOnCheck = objectiveData[i].callbackOnCheck;
            const objectiveClone = deepCloneObject<Objective>(objectiveData[i]);

            objectiveClone.callbackOnStart = callbackOnStart;
            objectiveClone.callbackOnFinish = callbackOnFinish;
            objectiveClone.callbackOnCheck = callbackOnCheck;

            uniqueObjectives.push(objectiveClone);
        }

        this.objectives = this.objectives.concat(uniqueObjectives);
    }

    /**
     * Call this to cleanup a job.
     *
     * @param {string} reason
     * @memberof Job
     */
    quit(reason: string) {
        Athena.systems.job.instance.clear(this.player);

        if (this.player.valid) {
            alt.emitClient(this.player, ObjectiveEvents.JOB_SYNC, null);
            Athena.player.emit.message(this.player, reason);
        }

        this.removeAllVehicles();
        this.removeAttachable();

        if (typeof this.quitCallback !== 'function') {
            return;
        }

        this.quitCallback(this, reason);
    }

    /**
     * Remove the first element of the objective list and move on to the next.
     * @private
     * @memberof JobBuilder
     */
    async goToNextObjective() {
        const returnedObjective = this.objectives.shift();
        if (returnedObjective && returnedObjective.callbackOnFinish) {
            returnedObjective.callbackOnFinish(this.player);
        }

        if (this.objectives.length <= 0) {
            /**
             * We may want to do something async when the mission is completed.
             * Before it is cleaned up.
             */
            if (typeof this.completedCallback === 'function') {
                await this.completedCallback(this).catch((error) => alt.logError(error));
            }

            this.removeAllVehicles();
            Athena.player.emit.message(this.player, `Job Completed`);
            Athena.systems.job.instance.clear(this.player);

            alt.emitClient(this.player, ObjectiveEvents.JOB_SYNC, null);
            return;
        }

        this.syncObjective();
    }

    /**
     * Get the current player that is utilizing this job instance.
     *
     * @return {alt.Player}
     * @memberof Job
     */
    getPlayer(): alt.Player {
        return this.player;
    }

    /**
     * Remove the current job attachable.
     * @return {*}
     * @memberof Job
     */
    removeAttachable() {
        const objective = this.getCurrentObjective();
        if (!objective.attachable) {
            return;
        }

        Athena.player.emit.objectRemove(this.player, objective.attachable.uid);
    }

    /**
     * Emits data down to the player to start handling job information.
     * @private
     * @memberof Job
     */
    private syncObjective() {
        const objective = this.getCurrentObjective();

        if (objective.callbackOnStart) {
            objective.callbackOnStart(this.player);
        }

        if (objective.animation && objective.animation.atObjectiveStart) {
            Athena.systems.job.triggers.tryAnimation(this.player, objective);
        }

        if (objective.attachable && objective.attachable.atObjectiveStart) {
            Athena.systems.job.triggers.tryAttach(this.player, objective);
        }

        if (objective.eventCall && objective.eventCall.callAtStart) {
            Athena.systems.job.triggers.tryEventCall(this.player, objective);
        }

        alt.emitClient(this.player, ObjectiveEvents.JOB_SYNC, deepCloneObject(objective));
    }

    /**
     * Get the current objective the player is completing.
     * @return {(Objective | null)}
     * @memberof JobBuilder
     */
    getCurrentObjective(): Objective | null {
        return this.objectives[0];
    }

    /**
     * Get the time since this job has started.
     *
     * @return {number}
     * @memberof Job
     */
    getElapsedMilliseconds(): number {
        return Date.now() - this.startTime;
    }

    /**
     * Inserts an objective to the beginning of the objectives array.
     *
     * @param {Objective} objectiveData
     * @memberof Job
     */
    addNextObjective(objectiveData: Objective) {
        const objectiveClone = cloneObjective(objectiveData);
        this.objectives.splice(0, 0, objectiveClone);
        this.syncObjective();
    }

    /**
     * Set the async callback that is called when a user completed a job.
     *
     * @param {(job: Job) => Promise<void>} callback
     * @memberof Job
     */
    setCompletedCallback(callback: () => Promise<void>) {
        this.completedCallback = callback;
    }

    /**
     * Set the callback that is called when a user quits a job.
     *
     * @param {(job: Job, reason: string) => void} callback
     * @memberof Job
     */
    setQuitCallback(callback: (job: Job, reason: string) => void) {
        this.quitCallback = callback;
    }
}