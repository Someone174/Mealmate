// Base44 removed — stub keeps imports working without SDK
export const base44 = {
  auth: {
    me: async () => null,
    logout: () => {},
    redirectToLogin: () => {},
  },
  entities: {
    Recipe: {
      list: async () => [],
      bulkCreate: async () => {},
    },
  },
  functions: {
    invokeFunctionByName: async () => ({}),
  },
  integrations: {
    Core: {
      InvokeLLM: async () => ({}),
    },
  },
};
