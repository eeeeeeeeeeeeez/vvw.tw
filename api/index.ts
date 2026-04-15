import app from '../server/server.js';

// Vercel 在部署 ESM 專案時，對於 Express 的導出非常嚴格。
// 這裡確保將 app 作為預設導出，以便 Vercel 能正確將請求路由到 Express。
export default app;
