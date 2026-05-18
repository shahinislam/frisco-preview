import parse from 'html-react-parser'
import { addLazyLoadToImages } from '../utils/lazy-images';

export default function MainFooter({ footer = {} }) {
    
    if (!footer || !footer.menus) {
        return <div style={{ minHeight: '100px' }}></div>;
    }

    return (
        <>
            {footer.menus && parse(addLazyLoadToImages(footer.menus))}
        </>
    )
}
