// Base44 Client stub
export const base44 = {
  integrations: {
    Core: {
      InvokeLLM: async (options) => {
        console.log('InvokeLLM called:', options);
        return { response: 'Mock response' };
      },
      UploadFile: async (options) => {
        console.log('UploadFile called:', options);
        return { url: 'mock-url' };
      },
    },
  },
  entities: {
    MakeupLook: {
      list: async () => [],
      create: async (data) => ({ id: Date.now(), ...data }),
      update: async (id, patch) => ({ id, ...patch }),
      delete: async (id) => ({ id }),
    },
  },
};
