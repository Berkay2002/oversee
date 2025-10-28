import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

const faqItems = [
  {
    id: "reports",
    question: "Hur skapar jag en ny rapport?",
    answer:
      "Gå till Ny Rapport från sidomenyn och följ guiden. Formuläret sparar automatiskt utkast så att du kan fortsätta senare.",
  },
  {
    id: "collaboration",
    question: "Kan jag dela en rapport med kollegor?",
    answer:
      "Ja. När du har publicerat rapporten kan du bjuda in kollegor genom att lägga till dem som medförfattare eller skicka en delningslänk.",
  },
  {
    id: "support",
    question: "Var hittar jag teknisk support?",
    answer:
      "Kontakta supportteamet via knappen nedan eller skicka ett e-postmeddelande till support@verkstadsinsikt.se så återkommer vi inom en arbetsdag.",
  },
];

export const metadata = {
  title: "Hjälp",
};

export default function HelpPage() {
  return (
    <div className="space-y-10 p-4 pb-12 md:p-8">
      <div className="space-y-3">
        <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
          Support och guider
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Hjälpcenter</h1>
        <p className="max-w-2xl text-muted-foreground">
          Lär dig hur du navigerar i Verkstads Insikt, får ut mer av dina rapporter och hittar rätt kontaktväg när du behöver
          hjälp.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Kom igång snabbt</CardTitle>
            <CardDescription>
              Tre enkla steg för att börja jobba effektivt i plattformen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                  1
                </span>
                <div>
                  <p className="font-medium text-foreground">Välj organisation</p>
                  <p>Öppna sidomenyn och säkerställ att du arbetar i rätt verkstad eller organisation.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                  2
                </span>
                <div>
                  <p className="font-medium text-foreground">Skapa din första rapport</p>
                  <p>Gå till Ny Rapport för att använda vår steg-för-steg-guide med färdiga fält och bilduppladdning.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                  3
                </span>
                <div>
                  <p className="font-medium text-foreground">Dela resultatet</p>
                  <p>Publicera rapporten och dela den med teamet eller kunden direkt från översikten.</p>
                </div>
              </li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Navigationstips</CardTitle>
            <CardDescription>
              Utforska de viktigaste delarna av Verkstads Insikt.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm text-muted-foreground">
              <div>
                <p className="font-medium text-foreground">Rapporter</p>
                <p>Skapa, följ upp och arkivera ärenden. Använd filtren i Alla Rapporter för att hitta exakt det du söker.</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Bilkollen</p>
                <p>Få koll på fordon och platser. Samla information, historik och status i ett och samma gränssnitt.</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Hantering</p>
                <p>Administrera kategorier och tekniker så att dina processer hålls uppdaterade och standardiserade.</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Administration</p>
                <p>Hantera användare och inbjudningar. Lägg till nya kollegor eller granska väntande förfrågningar.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="gap-1">
          <CardTitle>Vanliga frågor</CardTitle>
          <CardDescription>
            Sök svar på återkommande frågor om arbetsflöden och support.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger className="text-left">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Behöver du mer hjälp?</CardTitle>
          <CardDescription>
            Vi finns här för att stötta dig och ditt team.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            Besök vårt hjälpcenter för fler guider, mallar och utbildningsvideos. Du kan också skicka in förbättringsförslag via
            feedback-formuläret.
          </p>
          <Separator />
          <div>
            <p className="font-medium text-foreground">Supporttider</p>
            <p>Vardagar 08:00-17:00 (CET)</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Responstid</p>
            <p>Vi svarar normalt inom en arbetsdag.</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="mailto:support@verkstadsinsikt.se">Kontakta support</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="https://verkstadsinsikt.se/utbildning" target="_blank" rel="noopener noreferrer">
              Öppna hjälpresurser
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
