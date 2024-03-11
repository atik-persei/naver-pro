import { BaseStorage, createStorage, StorageType } from '@src/shared/storage/base';

type TocDefaultTag = 'blockquote' | 'b'

type ConfigStorage = BaseStorage<Config> & {
  toggle: (type: string) => Promise<void>;
  update: (type: string, value: TocDefaultTag) => Promise<void>;
};

type Config = {
  Toc: boolean
  TocDeafultTag: TocDefaultTag;
  TocGlobalApplicationScope: boolean;
};

const storage = createStorage<Config>('config', { Toc: true, TocDeafultTag: 'blockquote', TocGlobalApplicationScope: false }, {
  storageType: StorageType.Local,
  liveUpdate: true,
});

const configStorage: ConfigStorage = {
  ...storage,
  toggle: async (type) => {
    if (type == 'toc') {
      await storage.set((currentConfig) => ({
        ...currentConfig,
        Toc: !currentConfig.Toc,
      }));

      await storage.set((currentConfig) => ({
        ...currentConfig,
        TocGlobalApplicationScope: false,
      }));
    }
    if (type == 'toc-global-application-scope') {
      await storage.set((currentConfig) => ({
        ...currentConfig,
        TocGlobalApplicationScope: !currentConfig.TocGlobalApplicationScope,
      }));
    }
  },
  update: async (type, value) => {
    if (type == 'toc-criterion-object') {
      await storage.set((currentConfig) => ({
        ...currentConfig,
        TocDeafultTag: value,
      }));
    }
  }
};

export default configStorage;