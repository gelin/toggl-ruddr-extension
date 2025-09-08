import Popup from './Popup.svelte';
import { mount } from 'svelte'

const target = document.getElementById('popup')
if (!target) {
    throw new Error('Could not find popup container')
}

mount(Popup, { target })
