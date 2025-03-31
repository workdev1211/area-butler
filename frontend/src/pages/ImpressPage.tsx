import React from "react";
import {kudibaCompany} from "../../../shared/constants/constants";
import DefaultLayout from "../layout/defaultLayout";

export const ImpressPage = () => {


    return (
        <DefaultLayout title="Impressum" withHorizontalPadding={true}>
            <h2>Information according to § 5 TMG:</h2>
            <p dangerouslySetInnerHTML={{__html: kudibaCompany.formattedAddress()}}>
            </p>
            <h2>Represented by:</h2>
            <p>Alexander Timper</p>
            <h2>Kontakt:</h2>
            <p>E-Mail: info@area-butler.de<br/>
               Phone: +49 157 5807 5423</p>
            <h2>Register entry:</h2>
            <p>Registry Court: {kudibaCompany.court}<br/>
               Registration number: {kudibaCompany.regNr}</p>
            <h2>VAT</h2>
            <p>VAT identification number according to Section 27 a of the VAT Act: {kudibaCompany.vat}</p>
            <h2>Dispute resolution</h2>
            <p>We are not willing or obliged to participate in dispute resolution proceedings before a consumer arbitration board.</p>
            <h2>Liability for content</h2>
            <p>{'As a service provider, we are responsible for our own content on these pages in accordance with Section 7 (1) of the German Telemedia Act (TMG). However, according to Sections 8 to 10 of the German Telemedia Act (TMG), as a service provider, we are not obligated to monitor transmitted or stored third-party information or to investigate circumstances that indicate illegal activity. Obligations to remove or block the use of information under general law remain unaffected. However, liability in this regard is only possible at the time of knowledge about a specific violation of law. Upon knowledge of such violations, we will remove this content immediately.'}
            </p>
            <h2>Liability for links</h2>
            <p>{'Our website contains links to external third-party websites over whose content we have no influence. Therefore, we cannot accept any liability for this external content. The respective provider or operator of the linked pages is always responsible for the content of the linked pages. The linked pages were checked for possible legal violations at the time of linking. Illegal content was not recognizable at the time of linking. However, permanent monitoring of the content of the linked pages is not reasonable without concrete evidence of a legal violation. Upon notification of any legal violations, we will remove such links immediately.'}</p>
            <h2>copyright</h2>
            <p>{'The content and works on these pages created by the site operators are subject to German copyright law. Reproduction, processing, distribution, and any type of exploitation outside the limits of copyright law require the written consent of the respective author or creator. Downloads and copies of this site are permitted for private, non-commercial use only. To the extent that the content on this site was not created by the operator, the copyrights of third parties are respected. In particular, third-party content is marked as such. Should you nevertheless become aware of a copyright infringement, please notify us accordingly. Upon knowledge of any violations, we will remove such content immediately.'}</p>
        </DefaultLayout>
    );
};

export default ImpressPage;

