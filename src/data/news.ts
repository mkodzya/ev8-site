// Weekly news for couriers in Georgia (Kardu, 05.11.2026: «еженедельные
// новости, связанные с электромопедами в Грузии … раз в неделю постить на
// сайте»; the scope he chose the same day: everything that matters to a
// courier — electric mopeds and scooters, traffic rules, licences, petrol
// prices, the delivery platforms Wolt, Glovo and Bolt Food in Georgia).
//
// The rules of an issue:
//   - every item is a real piece of news with its source: the outlet, the
//     address of the article and the day it came out. Nothing without a source,
//     nothing "plausible" (the owner's rule 1). A week with no news has no
//     issue — it is skipped, not filled;
//   - the text is our own short retelling — facts and figures of the source,
//     never its sentences copied. No names of private people (a victim, a
//     courier), only what was public and official;
//   - a number keeps its digits on one line: a no-break space in 16 839;
//   - Georgian and English say the same thing. Georgian is a draft until a
//     native speaker reads it (book register, item 15);
//   - an issue reaches ev8.ge with a release, on Kardu's or Mika's word.
//
// Newest issue first. `date` is the day the issue was put together; `from`
// and `to` are the days its news came out.

export interface NewsText {
  title: string;
  text: string;
}

export interface NewsItem {
  /** The day the source published it, YYYY-MM-DD. */
  date: string;
  /** The outlet, as it names itself. */
  source: string;
  /** The article itself. */
  url: string;
  ka: NewsText;
  en: NewsText;
}

export interface Issue {
  /** The day the issue was put together, YYYY-MM-DD; also its address: news/<date>/. */
  date: string;
  from: string;
  to: string;
  items: NewsItem[];
}

export const issues: Issue[] = [
  {
    date: '2026-11-12',
    from: '2026-11-06',
    to: '2026-11-12',
    items: [
      {
        date: '2026-11-12',
        source: 'priceshub.ge',
        url: 'https://priceshub.ge/',
        ka: {
          title: 'რეგულარი ბენზინი — 3,97 ₾ ლიტრი',
          text: '12 ნოემბერს რეგულარი ბენზინის (92/93) ფასის მედიანა საქართველოს ბენზინგასამართ ქსელებში ლიტრზე 3,97 ₾ იყო, 5 ნოემბერს — 4,00 ₾.',
        },
        en: {
          title: 'Regular petrol: 3.97 ₾ a litre',
          text: 'On 12 November the median price of regular petrol (92/93) across Georgia’s filling-station chains was 3.97 ₾ a litre, down from 4.00 ₾ on 5 November.',
        },
      },
      {
        date: '2026-11-12',
        source: 'Crystalauto (BM.GE)',
        url: 'https://www.crystalauto.ge/news/8924-noembris-bolos-rustavelis-gamzirze-shuknishnebi-ar-ikneba-chartuli-tumtsa-proekti-dasruleb',
        ka: {
          title: 'რუსთაველის გამზირზე შუქნიშნები საახალწლო ღონისძიებების დასრულებამდე არ ჩაირთვება',
          text: 'თბილისის მერის, კახა კალაძის თქმით, რუსთაველის გამზირის რეაბილიტაცია დათქმულ ვადაში, ნოემბრის ბოლოს დასრულდება. შუქნიშნები დამონტაჟდება, მაგრამ საახალწლო ღონისძიებების დასრულებამდე არ ჩაირთვება და გამზირზე მოძრაობის ახალი სქემები იმოქმედებს. ავტობუსებს თავიანთი ზოლები დარჩებათ.',
        },
        en: {
          title: 'Rustaveli Avenue: traffic lights stay off until the New Year events are over',
          text: 'Tbilisi mayor Kakha Kaladze says the rehabilitation of Rustaveli Avenue will be finished on schedule at the end of November. The traffic lights will be installed but not switched on until the New Year events are over, and new traffic schemes will apply on the avenue meanwhile. Buses keep their own lanes.',
        },
      },
    ],
  },
  {
    date: '2026-11-05',
    from: '2026-10-29',
    to: '2026-11-05',
    items: [
      {
        date: '2026-11-05',
        source: 'priceshub.ge',
        url: 'https://priceshub.ge/',
        ka: {
          title: 'რეგულარი ბენზინი — 4,00 ₾ ლიტრი',
          text: '5 ნოემბერს რეგულარი ბენზინის (92/93) ფასის მედიანა საქართველოს ბენზინგასამართ ქსელებში ლიტრზე 4,00 ₾ იყო, 11 ოქტომბერს — 3,96 ₾.',
        },
        en: {
          title: 'Regular petrol: 4.00 ₾ a litre',
          text: 'On 5 November the median price of regular petrol (92/93) across Georgia’s filling-station chains was 4.00 ₾ a litre, up from 3.96 ₾ on 11 October.',
        },
      },
      {
        date: '2026-11-04',
        source: 'Crystalauto (BM.GE)',
        url: 'https://www.crystalauto.ge/news/8871-17-20-tslis-akhalgazrdebze-pirveladi-martvis-motsmobebis-468-modis--statistika',
        ka: {
          title: 'ივლის–სექტემბერში 16 839 ადამიანმა პირველად აიღო მართვის მოწმობა',
          text: 'შსს-ის მონაცემებით, 2026 წლის მესამე კვარტალში საქართველოში 16 839 პირველადი მართვის მოწმობა გაიცა. 46,8% — 17–20 წლის ახალგაზრდებზე მოდის, თბილისზე — 4 805 (28,5%). კატეგორიების მიხედვით მონაცემები არ გამოქვეყნებულა, ამიტომ ახალი AM მოწმობების რაოდენობა უცნობია.',
        },
        en: {
          title: '16,839 people got their first driving licence in July–September',
          text: 'Georgia issued 16,839 first-time driving licences in the third quarter of 2026, according to the Ministry of Internal Affairs. 46.8% went to people aged 17–20, and 4,805 (28.5%) were issued in Tbilisi. The figures are not broken down by category, so the number of new AM licences is not known.',
        },
      },
    ],
  },
];
