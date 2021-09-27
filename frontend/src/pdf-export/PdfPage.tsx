import { CSSProperties } from "react";


export const PdfPage : React.FunctionComponent = ({children}) => {

    const style = {
        'page-break-after': 'always'
    } as CSSProperties;

    return (<div className="page p-10" style={style}>
        {children}
    </div>)


}