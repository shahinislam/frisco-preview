import { useEffect } from 'react'

export default function BootstrapLoader() {
	useEffect(() => {
		// Load Bootstrap JS only on client side when needed
		if (typeof window !== 'undefined') {
			import('bootstrap/dist/js/bootstrap.bundle.min.js')
		}
	}, [])

	return null
}