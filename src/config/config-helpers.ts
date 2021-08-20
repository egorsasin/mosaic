import { PartialMosaicConfig, RuntimeConfig } from './config';
import { defaultConfig } from './default-config';
import { mergeConfig } from './merge-config';

let activeConfig = defaultConfig;

export function setConfig(userConfig: PartialMosaicConfig): void {
  activeConfig = mergeConfig(activeConfig, userConfig);
}

export function getConfig(): Readonly<RuntimeConfig> {
  return activeConfig;
}
