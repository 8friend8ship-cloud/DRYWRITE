export type AccessTier = 'FREE' | 'PAID' | 'ADMIN';

export type CommonAppShellContract = {
  version: string;
  auth: {
    enabled: boolean;
    modes: Array<'GUEST' | 'GOOGLE' | 'EMAIL'>;
    requireLoginFor: string[];
  };
  commerce: {
    enabled: boolean;
    productSlots: string[];
    checkoutStatus: 'DISABLED' | 'TEST' | 'READY';
    affiliateDisclosureRequired: boolean;
  };
  ads: {
    freeUserOnly: boolean;
    provider: 'GOOGLE_ADSENSE' | 'NONE';
    slots: string[];
    hideForPaidUsers: boolean;
  };
  localization: {
    defaultLocale: string;
    languagePackMode: 'LOCAL_PACK_ON_DEMAND';
    persistSelection: boolean;
    bundleChatbotKnowledge: boolean;
    bundlePersonaRules: boolean;
    bundleLanguageResearchRules: boolean;
  };
  chatbot: {
    mode: 'LOCAL_FIRST_KNOWLEDGE_PACK';
    bundledData: Array<'APP_GUIDE' | 'EXPECTED_FAQ' | 'PERSONA' | 'LANGUAGE_RULES' | 'ERROR_HELP' | 'FEATURE_HELP'>;
    fallbackToCentralAgent: boolean;
    expectedQuestionPrecompute: boolean;
  };
  resume: {
    mode: 'HYBRID_AUTO_RESUME_AND_MANUAL_OPEN';
    autoResumeRecentSession: boolean;
    manualOpenHistoryFile: boolean;
    localSnapshotFirst: boolean;
    cloudSyncOptIn: boolean;
  };
  packs: {
    heavyAssetMode: 'ON_DEMAND_DELTA_DOWNLOAD';
    historyMode: 'LOCAL_FIRST';
    cacheManifestRequired: boolean;
    entitlementRequiredForPaidPacks: boolean;
    downloadableTypes: Array<'LANGUAGE' | 'CHATBOT' | 'PERSONA' | 'SCENE' | 'VIDEO' | 'AUDIO' | 'IMAGE' | 'PDF' | 'TEMPLATE' | 'HISTORY'>;
  };
  privacy: {
    localHistoryDefault: boolean;
    cloudSyncOptIn: boolean;
    secretsInBrowserForbidden: boolean;
  };
};

export const COMMON_APP_SHELL: CommonAppShellContract = {
  version: '2026-08-18.2',
  auth: {
    enabled: true,
    modes: ['GUEST', 'GOOGLE', 'EMAIL'],
    requireLoginFor: ['SAVE_HISTORY', 'PAID_PACK', 'PURCHASE', 'SYNC']
  },
  commerce: {
    enabled: true,
    productSlots: ['INLINE_RECOMMENDATION', 'RESULT_RECOMMENDATION', 'RESOURCE_PANEL'],
    checkoutStatus: 'DISABLED',
    affiliateDisclosureRequired: true
  },
  ads: {
    freeUserOnly: true,
    provider: 'GOOGLE_ADSENSE',
    slots: ['CONTENT_INLINE', 'RESULT_FOOTER'],
    hideForPaidUsers: true
  },
  localization: {
    defaultLocale: 'ko-KR',
    languagePackMode: 'LOCAL_PACK_ON_DEMAND',
    persistSelection: true,
    bundleChatbotKnowledge: true,
    bundlePersonaRules: true,
    bundleLanguageResearchRules: true
  },
  chatbot: {
    mode: 'LOCAL_FIRST_KNOWLEDGE_PACK',
    bundledData: ['APP_GUIDE', 'EXPECTED_FAQ', 'PERSONA', 'LANGUAGE_RULES', 'ERROR_HELP', 'FEATURE_HELP'],
    fallbackToCentralAgent: true,
    expectedQuestionPrecompute: true
  },
  resume: {
    mode: 'HYBRID_AUTO_RESUME_AND_MANUAL_OPEN',
    autoResumeRecentSession: true,
    manualOpenHistoryFile: true,
    localSnapshotFirst: true,
    cloudSyncOptIn: true
  },
  packs: {
    heavyAssetMode: 'ON_DEMAND_DELTA_DOWNLOAD',
    historyMode: 'LOCAL_FIRST',
    cacheManifestRequired: true,
    entitlementRequiredForPaidPacks: true,
    downloadableTypes: ['LANGUAGE', 'CHATBOT', 'PERSONA', 'SCENE', 'VIDEO', 'AUDIO', 'IMAGE', 'PDF', 'TEMPLATE', 'HISTORY']
  },
  privacy: {
    localHistoryDefault: true,
    cloudSyncOptIn: true,
    secretsInBrowserForbidden: true
  }
};
