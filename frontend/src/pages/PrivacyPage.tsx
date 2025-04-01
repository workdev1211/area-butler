import React from "react";
import { kudibaCompany } from "../../../shared/constants/constants";
import DefaultLayout from "../layout/defaultLayout";

export const PrivacyPage = () => {

    return (
        <DefaultLayout title="Privacy Policy" withHorizontalPadding={true}>
            <p>The following notes provide a simple overview of what happens to your personal data when you visit our website. Personal data is any data that can be used to identify you personally. For detailed information on the topic of data protection, please refer to our privacy policy provided below this text.</p>
            <h2>Data Collection on Our Website</h2>
            <h3>Who is responsible for data collection on this website?</h3>
            <p>The data processing on this website is carried out by the website operator. You can find their contact details in the impressum of this website.</p>
            <h3>How do we collect your data?</h3>
            <p>Your data is collected partly by you providing it to us. This could be data, for example, that you enter into a contact form. Other data is collected automatically when you visit the website through our IT systems. This includes mainly technical data (e.g., internet browser, operating system, or time of page request). The collection of this data occurs automatically as soon as you enter our website.</p>
            <h3>What do we use your data for?</h3>
            <p>Your data is collected to ensure the error-free provision of the website.</p>
            <h3>What rights do you have regarding your data?</h3>
            <p>You have the right at any time to request information free of charge about the origin, recipient, and purpose of your stored personal data. You also have the right to request the correction, blocking, or deletion of this data. For this purpose, as well as for further questions on the subject of data protection, you can contact us at any time via the address provided in the impressum. Furthermore, you have the right to lodge a complaint with the competent supervisory authority.</p>
            <h2>Analysis Tools and Third-Party Tools</h2>
            <p>Your surfing behavior can be statistically evaluated when visiting websites. This mainly happens through cookies and so-called analysis programs. The analysis of your surfing behavior is usually done anonymously; it cannot be traced back to you. You can object to this analysis or prevent it by not using specific tools. Detailed information can be found in the following privacy policy. You can object to this analysis. We will inform you about the possibility of objection in this privacy policy.</p>
            <h2>General Notes and Mandatory Information</h2>
            <h3>Data Protection</h3>
            <p>The operators of these pages take the protection of your personal data very seriously. We treat your personal data confidentially and in accordance with the legal data protection regulations as well as this privacy policy. When you use this website, various personal data is collected. Personal data is data that can be used to identify you personally. This privacy policy explains what data we collect and what we use it for. It also explains how and for what purpose this is done. We point out that data transmission over the Internet (e.g., when communicating via email) may have security vulnerabilities. A complete protection of data against access by third parties is not possible.</p>
            <h3>Notes on the Responsible Party</h3>
            <p>The responsible party for data processing on this website is:</p>
            <p className="pt-2" dangerouslySetInnerHTML={{ __html: kudibaCompany.formattedAddress() }}></p>
            <p className="pb-2">{kudibaCompany.mail}</p>
            <p>The responsible party is the natural or legal person who alone or jointly with others decides on the purposes and means of processing personal data (e.g., names, email addresses, etc.).</p>
            <h3>Revocation of Your Consent to Data Processing</h3>
            <p>Many data processing operations are only possible with your explicit consent. You can revoke your previously given consent at any time. A simple informal notification by email to us is sufficient. The lawfulness of the data processing that took place until the revocation remains unaffected by the revocation.</p>
            <h3>Right to Complain to the Competent Supervisory Authority</h3>
            <p>In the event of data protection law violations, the affected person has the right to lodge a complaint with the competent supervisory authority. The competent supervisory authority in data protection matters is the state data protection officer of the federal state in which our company is based. A list of data protection officers and their contact information can be found at the following link: 
                <a className="pl-2 link-primary" href="https://www.bfdi.bund.de/DE/Infothek/Anschriften_Links/anschriften_links-node.html">https://www.bfdi.bund.de/DE/Infothek/Anschriften_Links/anschriften_links-node.html</a>.
            </p>
            <h3>Right to Data Portability</h3>
            <p>You have the right to receive data that we process based on your consent or in fulfillment of a contract in a structured, commonly used, and machine-readable format, and to transmit those data to another controller. If you request the direct transmission of the data to another responsible party, this will be done only as far as technically feasible.</p>
            <h3>SSL or TLS Encryption</h3>
            <p>This site uses SSL or TLS encryption for security reasons and to protect the transmission of confidential content, such as orders or inquiries that you send to us as the site operator. You can recognize an encrypted connection by the address line of the browser changing from "http://" to "https://" and by the lock symbol in your browser line. When the SSL or TLS encryption is activated, the data you transmit to us cannot be read by third parties.</p>
            <h3>Information, Blocking, Deletion</h3>
            <p>You have the right to receive information at any time free of charge about your stored personal data, its origin and recipient, and the purpose of the data processing and, if applicable, a right to correction, blocking or deletion of this data in accordance with applicable legal provisions. For this purpose, as well as for further questions regarding personal data, you can contact us at any time via the address provided in the impressum.</p>
            <h2>Data Collection on Our Website</h2>
            <h3>Server Log Files</h3>
            <p>The provider of the website automatically collects and stores information in so-called server log files that your browser transmits to us. This includes:
                <ul className="list-disc ml-5 py-1">
                    <li>Browser type and version</li>
                    <li>Operating system used</li>
                    <li>Referrer URL</li>
                    <li>Hostname of the accessing computer</li>
                    <li>Time of server request</li>
                    <li>IP address</li>
                </ul>
                A merging of this data with other data sources is not performed. The legal basis for the data processing is Article 6 (1) (f) GDPR, which allows the processing of data to fulfill a contract or to take precontractual measures.
            </p>
            <h3>Mapbox, Inc.</h3>
            <p>A service from Mapbox, Inc. is used to display maps in environmental analyses and exposés. The following information is automatically transmitted for this purpose:</p>
            <ul className="list-disc ml-5 py-1">
                <li>IP address</li>
                <li>Browser type and version</li>
                <li>Operating system used</li>
                <li>Date and time of the server request</li>
                <li>Request content regarding the requested map locations</li>
            </ul>
            <p>The transmission of the data is done in consideration of the European Standard Contractual Clauses. Further information regarding the data processing by Mapbox, Inc. can be found in the <a className="link-primary" href="https://www.mapbox.com/legal/privacy/">privacy policy</a>.</p>
            <p>The legal basis for the data processing is Article 6 (1) (f) GDPR, which allows the processing of data to fulfill a contract or to take precontractual measures.</p>
            <h3>Google Places API / Web Service</h3>
            <p>For the purpose of automatic address completion, we use the web service Google Places API provided by Google. The use of the service requires the automatic transmission of the following information:</p>
            <ul className="list-disc ml-5 py-1">
                <li>IP address</li>
                <li>Browser type and version</li>
                <li>Date and time of the server request</li>
                <li>Entered content regarding address completion</li>
            </ul>
            <p>This use allows for easy completion of input fields in address fields in our application and thus constitutes a basis for data processing in accordance with Article 6 (1) (f) GDPR. For more information, please refer to <a className="link-primary" href="www.google.com/policies/privacy">Google's privacy policy</a>.</p>
            <h3>Stripe</h3>
            <p>Stripe is an online payment service that allows for automated billing and payment for our services. The following data is collected for this purpose:</p>
            <ul className="list-disc ml-5 py-1">
                <li>IP address</li>
                <li>Browser type and version</li>
                <li>Date and time of the server request</li>
                <li>First name and last name</li>
                <li>Address</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Credit card number</li>
            </ul>
            <p>Stripe uses this data for:
                <ul className="list-disc ml-5 py-1">
                    <li>Determining account coverage</li>
                    <li>Determining credit limits</li>
                    <li>Automated payment processing</li>
                </ul>
            </p>
            <p>This use allows for automatic billing and payment processing and thus provides a basis for data processing in accordance with Article 6 (1) (f) GDPR. Further information can be found in <a className="link-primary" href="https://stripe.com/en-de/privacy-center/legal">Stripe's privacy policy</a>.</p>
            <h3>Auth0</h3>
            <p>For authentication and authorization, the services of auth0.com are used. For this purpose, the following information is transmitted, among others:</p>
            <ul className="list-disc ml-5 py-1">
                <li>Email address</li>
                <li>Browser type and version</li>
                <li>Login date</li>
                <li>First name and last name</li>
            </ul>
            <p>This use allows GDPR-compliant implementation of the necessary authentication and authorization mechanisms. Details can be found in the <a className="link-primary" href="https://auth0.com/de/privacy">privacy policy of Auth0</a>.</p>
            <h2>Contact</h2>
            <p>If you contact us by email, we will process your personal data only to the extent that there is a legitimate interest in the processing (Article 6 (1) (f) GDPR), you have consented to the data processing (Article 6 (1) (a) GDPR), the processing is necessary for the initiation, establishment, content design or modification of a legal relationship between you and us (Article 6 (1) (b) GDPR), or another legal regulation permits the processing. Your personal data will remain with us until you request us to delete it, revoke your consent to storage, or the purpose for data storage ceases to apply (e.g., after your inquiry has been processed). Mandatory legal provisions – in particular tax and commercial retention periods – remain unaffected. You have the right at any time to request free information about the origin, recipient, and purpose of your stored personal data. You also have the right to object, to data portability and to file a complaint with the competent supervisory authority. Furthermore, you can request the correction, blocking, deletion, and under certain circumstances the restriction of the processing of your personal data.</p>
        </DefaultLayout>
    );
};

export default PrivacyPage;