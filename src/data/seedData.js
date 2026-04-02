export const seedProjects = [
  {
    id: 'ppc-landing',
    title: 'PPC Landing Pages',
    status: 'active',
    pokemonId: 39,
    tasks: [
      { id: 'ppc-1', text: 'Write ROAR MOF page', completed: false },
      { id: 'ppc-2', text: 'Write ROAR BOF page', completed: false },
      { id: 'ppc-3', text: 'Write ROAR retargeting page', completed: false },
    ],
  },
  {
    id: 'gtm-n8n',
    title: 'GTM Engine n8n',
    status: 'active',
    pokemonId: 101,
    tasks: [
      { id: 'gtm-1', text: 'Fix merge deadlock bug', completed: false },
      { id: 'gtm-2', text: 'Fix remaining 5 bugs', completed: false },
      { id: 'gtm-3', text: 'Test full workflow end-to-end', completed: false },
    ],
  },
  {
    id: 'youtube-seo',
    title: 'YouTube SEO Asset',
    status: 'active',
    pokemonId: 441,
    tasks: [
      { id: 'yt-1', text: 'Upload first 10 clips', completed: false },
      { id: 'yt-2', text: 'Set up channel metadata', completed: false },
      { id: 'yt-3', text: 'Schedule remaining clips', completed: false },
    ],
  },
  {
    id: 'paddle-website',
    title: 'Paddle Website',
    status: 'parked',
    pokemonId: 79,
    blocked: 'Waiting on photography, Richard, testimonials',
    tasks: [],
  },
  {
    id: 'hs-chatbot',
    title: 'H&S Chatbot',
    status: 'parked',
    pokemonId: 137,
    blocked: 'Waiting on site content, ActiveCampaign, custom domain',
    tasks: [],
  },
  {
    id: 'ads-dashboard',
    title: 'Ads Dashboard',
    status: 'parked',
    pokemonId: 100,
    blocked: 'Waiting on Google Ads API approval',
    tasks: [],
  },
]

export const seedGameState = {
  xp: 0,
  lastCompletionDate: null,
  streak: 0,
}
