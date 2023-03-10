import { createRoot } from 'react-dom/client'
import { App } from './app'
import './index.css'

import '@hookstate/devtools'

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(document.getElementById('app')!)
root.render(<App />)
