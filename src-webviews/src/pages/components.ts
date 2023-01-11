import { shallowRef } from 'vue';

import Designs from './designs/Designs.vue';
import Icons from './icons/Icons.vue';
import InputBox from './input/InputBox.vue';
import Job from './job/Job.vue';
import MultiPageExample from './multiPageExample/MultiPageExample.vue';
import Storage from './storage/Storage.vue';
import Audio from './audio/Audio.vue';
import Actions from './actions/Actions.vue';
import AthenaLogo from './athenaLogo/AthenaLogo.vue';
import TestDrop from './testDrop/TestDrop.vue';
import WheelMenu from './wheelMenu/WheelMenu.vue';
import StateTest from './stateTest/StateTest.vue';

export const CORE_IMPORTS = {
    Actions: shallowRef(Actions),
    AthenaLogo: shallowRef(AthenaLogo),
    Audio: shallowRef(Audio),
    Designs: shallowRef(Designs),
    Icons: shallowRef(Icons),
    InputBox: shallowRef(InputBox),
    Job: shallowRef(Job),
    Storage: shallowRef(Storage),
    StateTest: shallowRef(StateTest),
    MultiPageExample: shallowRef(MultiPageExample),
    TestDrop: shallowRef(TestDrop),
    WheelMenu: shallowRef(WheelMenu),
};
