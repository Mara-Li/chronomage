import { getWeather } from "./getWeather";
import { globalSettings } from "./globalSettings";
import { schedule } from "./schedule";
import { template } from "./template";

export const commandsList = [template, getWeather, globalSettings, schedule];
export const autoCompleteCommands = [schedule];
