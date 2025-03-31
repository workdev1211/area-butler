import React from "react";
import {kudibaCompany} from "../../../shared/constants/constants";
import DefaultLayout from "../layout/defaultLayout";

export const PrivacyPage = () => {

    return (
        <DefaultLayout title="Datenschutz" withHorizontalPadding={true}>
            <p>Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten
                passiert, wenn Sie unsere Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie
                persönlich identifiziert werden können. Ausführliche Informationen zum Thema Datenschutz entnehmen Sie
                unserer unter diesem Text aufgeführten Datenschutzerklärung.</p>
            <h2>Datenerfassung auf unserer Website</h2>
            <h3>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</h3>
            <p>Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können
                Sie dem Impressum dieser Website entnehmen.</p>
            <h3>Wie erfassen wir Ihre Daten?</h3>
            <p>Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich z.B. um
                Daten handeln, die Sie in ein Kontaktformular eingeben. Andere Daten werden automatisch beim Besuch der
                Website durch unsere IT-Systeme erfasst. Das sind vor allem technische Daten (z.B. Internetbrowser,
                Betriebssystem oder Uhrzeit des Seitenaufrufs). Die Erfassung dieser Daten erfolgt automatisch, sobald
                Sie unsere Website betreten.
            </p>
            <h3>Wofür nutzen wir Ihre Daten?</h3>
            <p>Ihre Daten werden erhoben, um eine fehlerfreie Bereitstellung der Website zu gewährleisten.</p>
            <h3>Welche Rechte haben Sie bezüglich Ihrer Daten?</h3>
            <p>Sie haben jederzeit das Recht unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer
                gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung,
                Sperrung oder Löschung dieser Daten zu verlangen. Hierzu sowie zu weiteren Fragen zum Thema Datenschutz
                können Sie sich jederzeit unter der im Impressum angegebenen Adresse an uns wenden. Des Weiteren steht
                Ihnen ein Beschwerderecht bei der zuständigen Aufsichtsbehörde zu.</p>
            <h2>Analyse-Tools und Tools von Drittanbietern</h2>
            <p>Beim Besuch von Websiten kann Ihr Surf-Verhalten statistisch ausgewertet werden. Das geschieht vor allem
                mit Cookies und mit sogenannten Analyseprogrammen. Die Analyse Ihres Surf-Verhaltens erfolgt in der
                Regel anonym; das Surf-Verhalten kann nicht zu Ihnen zurückverfolgt werden. Sie können dieser Analyse
                widersprechen oder sie durch die Nichtbenutzung bestimmter Tools verhindern. Detaillierte Informationen
                dazu finden Sie in der folgenden Datenschutzerklärung.
                Sie können dieser Analyse widersprechen. Über die Widerspruchsmöglichkeiten werden wir Sie in dieser
                Datenschutzerklärung informieren.
            </p>
            <h2>2. Allgemeine Hinweise und Pflichtinformationen</h2>
            <h3>Datenschutz</h3>
            <p>Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre
                personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie
                dieser Datenschutzerklärung.
                Wenn Sie diese Website benutzen, werden verschiedene personenbezogene Daten erhoben. Personenbezogene
                Daten sind Daten, mit denen Sie persönlich identifiziert werden können. Die vorliegende
                Datenschutzerklärung erläutert, welche Daten wir erheben und wofür wir sie nutzen. Sie erläutert auch,
                wie und zu welchem Zweck das geschieht.
                Wir weisen darauf hin, dass die Datenübertragung im Internet (z.B. bei der Kommunikation per E-Mail)
                Sicherheitslücken aufweisen kann. Ein lückenloser Schutz der Daten vor dem Zugriff durch Dritte ist
                nicht möglich.</p>
            <h3>Hinweise zur verantwortlichen Stelle</h3>
            <p>Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:</p>
            <p className="pt-2" dangerouslySetInnerHTML={{__html: kudibaCompany.formattedAddress()}}></p>
            <p className="pb-2">{kudibaCompany.mail}</p>
            <p>Verantwortliche Stelle ist die natürliche oder juristische Person, die allein oder gemeinsam mit anderen
                über die Zwecke und Mittel der Verarbeitung von personenbezogenen Daten (z.B. Namen, E-Mail-Adressen o.
                Ä.) entscheidet.</p>
            <h3>Widerruf Ihrer Einwilligung zur Datenverarbeitung</h3>
            <p>Viele Datenverarbeitungsvorgänge sind nur mit Ihrer ausdrücklichen Einwilligung möglich. Sie können eine
                bereits erteilte Einwilligung jederzeit widerrufen. Dazu reicht eine formlose Mitteilung per E-Mail an
                uns. Die Rechtmäßigkeit der bis zum Widerruf erfolgten Datenverarbeitung bleibt vom Widerruf
                unberührt.</p>
            <h3>Beschwerderecht bei der zuständigen Aufsichtsbehörde</h3>
            <p>Im Falle datenschutzrechtlicher Verstöße steht dem Betroffenen ein Beschwerderecht bei der zuständigen
                Aufsichtsbehörde zu. Zuständige Aufsichtsbehörde in datenschutzrechtlichen Fragen ist der
                Landesdatenschutzbeauftragte des Bundeslandes, in dem unser Unternehmen seinen Sitz hat. Eine Liste der
                Datenschutzbeauftragten sowie deren Kontaktdaten können folgendem Link entnommen werden:
                <a className="pl-2 link-primary"
                   href="https://www.bfdi.bund.de/DE/Infothek/Anschriften_Links/anschriften_links-node.html">https://www.bfdi.bund.de/DE/Infothek/Anschriften_Links/anschriften_links-node.html</a>.
            </p>
            <h3>Recht auf Datenübertragbarkeit</h3>
            <p>Sie haben das Recht, Daten, die wir auf Grundlage Ihrer Einwilligung oder in Erfüllung eines Vertrags
                automatisiert verarbeiten, an sich oder an einen Dritten in einem gängigen, maschinenlesbaren Format
                aushändigen zu lassen. Sofern Sie die direkte Übertragung der Daten an einen anderen Verantwortlichen
                verlangen, erfolgt dies nur, soweit es technisch machbar ist.</p>
            <h3>SSL- bzw. TLS-Verschlüsselung</h3>
            <p>Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte, wie zum
                Beispiel Bestellungen oder Anfragen, die Sie an uns als Seitenbetreiber senden, eine SSL-bzw.
                TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie daran, dass die Adresszeile des
                Browsers von “http://” auf “https://” wechselt und an dem Schloss-Symbol in Ihrer Browserzeile.
                Wenn die SSL- bzw. TLS-Verschlüsselung aktiviert ist, können die Daten, die Sie an uns übermitteln,
                nicht von Dritten mitgelesen werden.</p>
            <h3>Auskunft, Sperrung, Löschung</h3>
            <p>Sie haben im Rahmen der geltenden gesetzlichen Bestimmungen jederzeit das Recht auf unentgeltliche
                Auskunft über Ihre gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger und den Zweck der
                Datenverarbeitung und ggf. ein Recht auf Berichtigung, Sperrung oder Löschung dieser Daten. Hierzu sowie
                zu weiteren Fragen zum Thema personenbezogene Daten können Sie sich jederzeit unter der im Impressum
                angegebenen Adresse an uns wenden.</p>
            <h2>3. Datenerfassung auf unserer Website</h2>
            <h3>Server-Log-Dateien</h3>
            <p>Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten
                Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. Dies sind:
                <ul className="list-disc ml-5 py-1">
                    <li>Browsertyp und Browserversion</li>
                    <li>verwendetes Betriebssystem</li>
                    <li>Referrer URL</li>
                    <li>Hostname des zugreifenden Rechners</li>
                    <li>Uhrzeit der Serveranfrage</li>
                    <li>IP-Adresse</li>
                </ul>
                Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen.
                Grundlage für die Datenverarbeitung ist Art. 6 Abs. 1 lit. f DSGVO, der die Verarbeitung von Daten zur
                Erfüllung eines Vertrags oder vorvertraglicher Maßnahmen gestattet.
            </p>
            <h3>Mapbox, Inc.</h3>
            <p>Für die Darstellung der Karten in der Umgebungsanalysen und dem Exposé wird ein Service von Mapbox, Inc.
                verwendet. Hierfür werden folgende Informationen automatisch übermittelt:</p>
            <ul className="list-disc ml-5 py-1">
                <li>IP-Adresse</li>
                <li>Browsertyp und Browserversion</li>
                <li>verwendetes Betriebssystem</li>
                <li>Datum und Uhrzeit der Serveranfrage</li>
                <li>Anfrage-Inhalte bezüglich der angefragten Karten-Lokationen</li>
            </ul>
            <p>Die Übermittlung der Daten erfolgt unter Berücksichtigung der European Standard Contractual Clauses.
                Weiter Informationen bezüglich der Datenverarbeitung durch Mapbox, Inc. sind der <a
                    className="link-primary"
                    href="https://www.mapbox.com/legal/privacy/">Datenschutzerklärung</a> zu entnehmen.</p>
            Grundlage für die Datenverarbeitung ist Art. 6 Abs. 1 lit. f DSGVO, der die Verarbeitung von Daten zur
            Erfüllung eines Vertrags oder vorvertraglicher Maßnahmen gestattet.
            <h3>Google Places API / Webdienst</h3>
            <p>Zum Zwecke der automatischen Adressvervollständigung nutzen wir den Web Service Google Places API von
                Google. Die Nutzung des Dienstes bedingt die automatische Übermittlung folgender Informationen:</p>
            <ul className="list-disc ml-5 py-1">
                <li>IP-Adresse</li>
                <li>Browsertyp und Browserversion</li>
                <li>Datum und Uhrzeit der Serveranfrage</li>
                <li>Eingegeben Inhalte bezüglich der Adressvervollständigung</li>
            </ul>
            Die Nutzung ermöglicht die einfache Vervollständigung der Eingabefelder von Adressfeldern in unserer
            Applikation und stellt somit eine Grundlage für die Datenverarbeitung gemäß Art. 6 Abs. 1 lit. f DSGVO dar.
            Weitere Informationen können der <a className="link-primary" href="www.google.com/policies/privacy">Datenschutzerklärung
            von Google</a> entnommen werden.
            <h3>Stripe</h3>
            <p>Stripe ist ein Online-Bezahldienst und ermöglicht die automatisierte Abrechnung und Zahlung von unseren Services. Hierfür werden folgende Daten erfasst:</p>
            <ul className="list-disc ml-5 py-1">
                <li>IP-Adresse</li>
                <li>Browsertyp und Browserversion</li>
                <li>Datum und Uhrzeit der Serveranfrage</li>
                <li>Vor- und Nachname</li>
                <li>Adresse</li>
                <li>E-Mail Adresse</li>
                <li>Telfonnummer</li>
                <li>Kreditkartennummer</li>
            </ul>
            Stripe nutzt diese Daten zur
            <ul className="list-disc ml-5 py-1">
                <li>Ermittlung der Kontodeckung</li>
                <li>Ermittlung des Kreditrahmens</li>
                <li>Automatischen Zahlungsabwicklung</li>
            </ul>
            Die Nutzung ermöglicht die automatische Abrechnung and Abwicklung von Zahlungen und stellt somit eine Grundlage für die Datenverarbeitung gemäß Art. 6 Abs. 1 lit. f DSGVO dar.
            Weitere Informationen können der <a className="link-primary" href="https://stripe.com/en-de/privacy-center/legal">Datenschutzerklärung
            von Stripe</a> entnommen werden.
            <h3>Auth0</h3>
            <p>
                Für die Authentifizierung und Authorisierung werden die Services von auth0.com verwendet. Zu diesem Zweck
                werden u.a. folgende Informationen übermittelt:
            </p>
            <ul className="list-disc ml-5 py-1">
                <li>E-Mail Addresse</li>
                <li>Browsertyp und Browserversion</li>
                <li>Login Datum</li>
                <li>Vor- und Nachname</li>
            </ul>
            Die Nutzung erlaubt eine DSGVO konforme Realisierung der benötigten Authentifizierungs- und
            Authorisierungsmechanismen. Details hierzu können der{" "}
            <a className="link-primary" href="https://auth0.com/de/privacy">
                Datenschutzerklärung von Auth0
            </a>{" "}
            entnommen werden.
            <h2>4. Kontaktaufnahme</h2>
            <p>Wenn Sie uns per E-Mail kontaktieren, verarbeiten wir Ihre personenbezogenen Daten nur, soweit an der
                Verarbeitung ein berechtigtes Interesse besteht (Art. 6 Abs. 1 lit. f DSGVO), Sie in die
                Datenverarbeitung eingewilligt haben (Art. 6 Abs. 1 lit. a DSGVO), die Verarbeitung für die Anbahnung,
                Begründung, inhaltliche Ausgestaltung oder Änderung eines Rechtsverhältnisses zwischen Ihnen und uns
                erforderlich ist (Art. 6 Abs. 1 lit. b DSGVO) oder eine sonstige Rechtsnorm die Verarbeitung gestattet.
                Ihre personenbezogenen Daten verbleiben bei uns, bis Sie uns zur Löschung auffordern, Ihre Einwilligung
                zur Speicherung widerrufen oder der Zweck für die Datenspeicherung entfällt (z.B. nach abgeschlossener
                Bearbeitung Ihres Anliegens). Zwingende gesetzlicheBestimmungen – insbesondere steuer- und
                handelsrechtliche Aufbewahrungsfristen – bleiben unberührt. Sie haben jederzeit das Recht, unentgeltlich
                Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten.
                Ihnen steht außerdem ein Recht auf Widerspruch, auf Datenübertragbarkeit und ein Beschwerderecht bei der
                zuständigen Aufsichtsbehörde zu. Ferner können Sie die Berichtigung, Sperrung, Löschung und unter
                bestimmten Umständen die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten verlangen.</p>
        </DefaultLayout>
    );
};

export default PrivacyPage;
