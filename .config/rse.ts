// @ts-expect-error temp
import { defineConfig } from "@reliverse/rse";

export default defineConfig({
  // RELIVERSE CONFIG (https://docs.reliverse.org/cli)
  // This config file is generated by @reliverse/cli
  // Restart the CLI to apply your config changes
  $schema: "./schema.json",

  // General project information
  projectName: "relifso",
  projectAuthor: "reliverse",
  projectDescription:
    "@reliverse/relifso is a modern filesystem toolkit for builders. drop-in replacement for `node:fs` and `fs-extra` — powered by native promises, built with es modules, and packed with dx-focused utilities.",
  version: "1.4.5",
  projectLicense: "MIT",
  projectState: "creating",
  projectRepository: "https://github.com/relifso",
  projectDomain: "https://example.com",
  projectCategory: "unknown",
  projectSubcategory: "unknown",
  projectTemplate: "unknown",
  projectTemplateDate: "unknown",
  projectArchitecture: "unknown",
  repoPrivacy: "unknown",
  projectGitService: "github",
  projectDeployService: "vercel",
  repoBranch: "main",

  // Primary tech stack/framework
  projectFramework: "npm-jsr",
  projectPackageManager: "bun",
  projectRuntime: "bun",
  preferredLibraries: {
    stateManagement: "unknown",
    formManagement: "unknown",
    styling: "unknown",
    uiComponents: "unknown",
    testing: "unknown",
    authentication: "unknown",
    databaseLibrary: "unknown",
    databaseProvider: "unknown",
    api: "unknown",
    linting: "unknown",
    formatting: "unknown",
    payment: "unknown",
    analytics: "unknown",
    monitoring: "unknown",
    logging: "unknown",
    forms: "unknown",
    notifications: "unknown",
    search: "unknown",
    uploads: "unknown",
    validation: "unknown",
    documentation: "unknown",
    icons: "unknown",
    mail: "unknown",
    cache: "unknown",
    storage: "unknown",
    cdn: "unknown",
    cms: "unknown",
    i18n: "unknown",
    seo: "unknown",
    motion: "unknown",
    charts: "unknown",
    dates: "unknown",
    markdown: "unknown",
    security: "unknown",
    routing: "unknown",
  },
  monorepo: {
    type: "none",
    packages: [],
    sharedPackages: [],
  },

  // List dependencies to exclude from checks
  ignoreDependencies: [],

  // Provide custom additional project details
  // always sent to Reliverse AI Chat & Agents
  customRules: {},

  // Project features
  features: {
    i18n: false,
    analytics: false,
    themeMode: "dark-light",
    authentication: false,
    api: false,
    database: false,
    testing: false,
    docker: false,
    ci: false,
    commands: [],
    webview: [],
    language: ["typescript"],
    themes: ["default"],
  },

  // Code style preferences
  codeStyle: {
    dontRemoveComments: true,
    shouldAddComments: true,
    typeOrInterface: "type",
    importOrRequire: "import",
    quoteMark: "double",
    semicolons: true,
    lineWidth: 80,
    indentStyle: "space",
    indentSize: 2,
    importSymbol: "~",
    trailingComma: "all",
    bracketSpacing: true,
    arrowParens: "always",
    tabWidth: 2,
    jsToTs: false,
    cjsToEsm: false,
    modernize: {
      replaceFs: false,
      replacePath: false,
      replaceHttp: false,
      replaceProcess: false,
      replaceConsole: false,
      replaceEvents: false,
    },
  },

  // Settings for cloning an existing repo
  multipleRepoCloneMode: false,
  customUserFocusedRepos: [],
  customDevsFocusedRepos: [],
  hideRepoSuggestions: false,
  customReposOnNewProject: false,

  // Set to false to disable opening the browser during env composing
  envComposerOpenBrowser: true,

  // Enable auto-answering for prompts to skip manual confirmations.
  // Make sure you have unknown values configured above.
  skipPromptsUseAutoBehavior: false,

  // Prompt behavior for deployment
  // Options: prompt | autoYes | autoNo
  deployBehavior: "prompt",
  depsBehavior: "prompt",
  gitBehavior: "prompt",
  i18nBehavior: "prompt",
  scriptsBehavior: "prompt",

  // Behavior for existing GitHub repos during project creation
  // Options: prompt | autoYes | autoYesSkipCommit | autoNo
  existingRepoBehavior: "prompt",

  // Behavior for Reliverse AI Chat & Agents
  // Options: promptOnce | promptEachFile | autoYes
  relinterConfirm: "promptOnce",
});
