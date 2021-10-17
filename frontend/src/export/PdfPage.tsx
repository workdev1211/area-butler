import { CSSProperties } from "react";


export const PdfPage : React.FunctionComponent = ({children}) => {

    const style = {
        'pageBreakAfter': 'always'
    } as CSSProperties;

    return (<div className="page p-10" style={style}>
        {children}
    </div>)


}