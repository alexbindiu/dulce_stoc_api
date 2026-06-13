import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../auth/entities/user.entity';
import { Role } from '../auth/entities/role.entity';
import { Product, Category } from '../products/entities/product.entity';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Message } from '../chat/schemas/message.schema';

// ── Helperi mici ─────────────────────────────────────────────────────────────
const rnd = (n: number) => Math.floor(Math.random() * n);
const pick = <T>(a: T[]): T => a[rnd(a.length)];
const rint = (a: number, b: number) => a + rnd(b - a + 1);
const chance = (p: number) => Math.random() < p;
function shuffle<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) { const j = rnd(i + 1); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
}
const pickN = <T>(a: T[], n: number): T[] => shuffle(a).slice(0, Math.min(n, a.length));
const dayStr = (offset: number) => new Date(Date.now() + offset * 864e5).toISOString().slice(0, 10);
const slug = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// ── Date demo ────────────────────────────────────────────────────────────────
type Biz = { n: string; t: string; c: string; o: [string, string]; scale: string; diet: string[]; spec: string; d: string };

const BUSINESSES: Biz[] = [
  { n: 'Cofetăria Dulce Vis', t: 'Cofetărie', c: 'Cluj-Napoca', o: ['Ioana', 'Marin'], scale: 'Scară mică', diet: ['Vegan', 'Fără gluten'], spec: 'torturi personalizate, opțiuni vegane', d: 'Cofetărie boutique cu torturi artizanale și alternative vegane, în inima Clujului.' },
  { n: 'Patiseria La Mama', t: 'Patiserie', c: 'Cluj-Napoca', o: ['Elena', 'Pop'], scale: 'Casă', diet: [], spec: 'rețete tradiționale ardelenești', d: 'Prăjituri ca la mama acasă, făcute zilnic din ingrediente locale.' },
  { n: 'Brutăria Pâinea Caldă', t: 'Brutărie', c: 'Cluj-Napoca', o: ['Andrei', 'Mureșan'], scale: 'Scară mare', diet: [], spec: 'croissante cu unt, foietaje', d: 'Brutărie artizanală cu cuptor pe vatră și foietaje proaspete în fiecare dimineață.' },
  { n: 'Cofetăria Regală', t: 'Cofetărie', c: 'București', o: ['Cristina', 'Dumitru'], scale: 'Scară mare', diet: ['Vegetarian'], spec: 'torturi de nuntă, prăjituri fine', d: 'Tradiție de peste 20 de ani în torturi de eveniment și prăjituri rafinate.' },
  { n: 'Patiseria Cocoșul de Aur', t: 'Patiserie', c: 'București', o: ['Vlad', 'Stancu'], scale: 'Scară mică', diet: [], spec: 'plăcinte, ștrudele', d: 'Plăcinte și ștrudele coapte la comandă, în stil clasic românesc.' },
  { n: 'French Bakery Élan', t: 'Brutărie', c: 'București', o: ['Sophie', 'Ionescu'], scale: 'Scară mică', diet: ['Vegetarian'], spec: 'croissante franțuzești, macarons', d: 'Patiserie franțuzească autentică: croissante, pain au chocolat și macarons.' },
  { n: 'Dulciuri de Altădată', t: 'Cofetărie', c: 'Iași', o: ['Maria', 'Cojocaru'], scale: 'Casă', diet: [], spec: 'amandine, savarine', d: 'Gustul copilăriei readus la viață: amandine, savarine și cremșnit.' },
  { n: 'Patiseria Trei Mere', t: 'Patiserie', c: 'Iași', o: ['Radu', 'Apostol'], scale: 'Scară mică', diet: ['Vegan'], spec: 'tarte cu fructe, deserturi vegane', d: 'Deserturi cu fructe de sezon și o gamă generoasă de opțiuni vegane.' },
  { n: 'Cofetăria Boema', t: 'Cofetărie', c: 'Timișoara', o: ['Diana', 'Lazăr'], scale: 'Scară mică', diet: ['Vegetarian'], spec: 'cheesecake, tiramisu', d: 'Atmosferă boemă și deserturi italiene autentice în centrul Timișoarei.' },
  { n: 'Brutăria Boabe & Maia', t: 'Brutărie', c: 'Timișoara', o: ['George', 'Toma'], scale: 'Scară mare', diet: ['Fără gluten'], spec: 'maia naturală, pâine fără gluten', d: 'Pâine cu maia naturală și o linie dedicată produselor fără gluten.' },
  { n: 'Patiseria Bucuria', t: 'Patiserie', c: 'Brașov', o: ['Alina', 'Barbu'], scale: 'Scară mică', diet: [], spec: 'eclere, choux', d: 'Eclere și choux à la crème în zeci de variante, lângă Piața Sfatului.' },
  { n: 'Cofetăria Casa Bunicii', t: 'Cofetărie', c: 'Brașov', o: ['Mihai', 'Sandu'], scale: 'Casă', diet: ['Vegetarian'], spec: 'cozonac, prăjituri de casă', d: 'Rețete de familie: cozonaci pufoși și prăjituri de casă coapte cu drag.' },
  { n: 'Sweet Corner', t: 'Cofetărie', c: 'Sibiu', o: ['Laura', 'Marcu'], scale: 'Scară mică', diet: ['Vegan', 'Vegetarian'], spec: 'deserturi raw-vegane, bowls', d: 'Colțul dulce al Sibiului: deserturi raw-vegane și prăjituri sănătoase.' },
  { n: 'Patiseria Hansel', t: 'Patiserie', c: 'Sibiu', o: ['Paul', 'Nagy'], scale: 'Scară mică', diet: [], spec: 'strudel săsesc, baumkuchen', d: 'Patiserie de inspirație săsească: strudel, baumkuchen și prăjituri cu mac.' },
  { n: 'Cofetăria Marea Neagră', t: 'Cofetărie', c: 'Constanța', o: ['Gabriela', 'Năstase'], scale: 'Scară mare', diet: [], spec: 'înghețată artizanală, torturi', d: 'Torturi și înghețată artizanală pe faleza Constanței, din 1998.' },
  { n: 'Patiseria Delta', t: 'Patiserie', c: 'Constanța', o: ['Sorin', 'Vasile'], scale: 'Scară mică', diet: ['Fără lactoză'], spec: 'baclava, deserturi orientale', d: 'Baclava, sarailie și deserturi orientale cu sirop de miere.' },
  { n: 'Brutăria Crișana', t: 'Brutărie', c: 'Oradea', o: ['Bianca', 'Farkas'], scale: 'Scară mare', diet: [], spec: 'kürtőskalács, covrigi', d: 'Kürtőskalács (colaci secuiești) copți pe loc și covrigi calzi.' },
  { n: 'Cofetăria Belle Époque', t: 'Cofetărie', c: 'Oradea', o: ['Teodora', 'Kovács'], scale: 'Scară mică', diet: ['Vegetarian'], spec: 'prăjituri art-nouveau, fursecuri', d: 'Eleganță Belle Époque: prăjituri fine și fursecuri de casă.' },
  { n: 'Patiseria Oltenia Dulce', t: 'Patiserie', c: 'Craiova', o: ['Florin', 'Dragomir'], scale: 'Casă', diet: [], spec: 'plăcinte oltenești, gogoși', d: 'Plăcinte oltenești, gogoși pufoase și merdenele cu brânză.' },
  { n: 'Cofetăria Floare de Tei', t: 'Cofetărie', c: 'Galați', o: ['Roxana', 'Munteanu'], scale: 'Scară mică', diet: ['Fără lactoză'], spec: 'torturi cu fructe, deserturi ușoare', d: 'Deserturi ușoare cu fructe și opțiuni fără lactoză, lângă Dunăre.' },
  { n: 'Patiseria Dunăreană', t: 'Patiserie', c: 'Galați', o: ['Cătălin', 'Iordache'], scale: 'Scară mică', diet: [], spec: 'foietaje, brânzoaice', d: 'Foietaje calde, brânzoaice și pateuri pentru micul dejun gălățean.' },
  { n: 'Cofetăria Aroma', t: 'Cofetărie', c: 'Ploiești', o: ['Simona', 'Petre'], scale: 'Scară mică', diet: ['Vegetarian'], spec: 'tiramisu, profiterol', d: 'Aroma cafelei și a vaniliei: tiramisu, profiterol și deserturi cu cremă.' },
  { n: 'Patiseria Aurora', t: 'Patiserie', c: 'Arad', o: ['Denisa', 'Crișan'], scale: 'Scară mică', diet: ['Vegan', 'Fără gluten'], spec: 'deserturi sănătoase, fără zahăr', d: 'Deserturi sănătoase, fără zahăr rafinat, vegane și fără gluten.' },
  { n: 'Brutăria Spicul', t: 'Brutărie', c: 'Arad', o: ['Bogdan', 'Oláh'], scale: 'Scară mare', diet: [], spec: 'pâine de secară, simit', d: 'Pâine de secară, simit cu susan și produse de panificație clasice.' },
];

type Tpl = { n: string; cat: Category; p: number; ing: string[]; d: string };

const PRODUCTS: Tpl[] = [
  { n: 'Tort Diplomat', cat: Category.Tort, p: 120, ing: ['frișcă', 'piscoturi', 'fructe confiate', 'gelatină'], d: 'Clasicul tort diplomat, ușor și răcoros, cu frișcă și fructe.' },
  { n: 'Tort de ciocolată', cat: Category.Tort, p: 135, ing: ['ciocolată neagră', 'ouă', 'unt', 'frișcă'], d: 'Blat umed de ciocolată cu ganache intens.' },
  { n: 'Tort Red Velvet', cat: Category.Tort, p: 145, ing: ['cacao', 'cremă de brânză', 'sfeclă roșie', 'unt'], d: 'Blat catifelat roșu cu cremă de brânză fină.' },
  { n: 'Tort Pădurea Neagră', cat: Category.Tort, p: 140, ing: ['ciocolată', 'vișine', 'frișcă', 'rom'], d: 'Vișine, frișcă și ciocolată — un clasic german.' },
  { n: 'Cheesecake cu fructe de pădure', cat: Category.Tort, p: 38, ing: ['cremă de brânză', 'biscuiți', 'fructe de pădure', 'unt'], d: 'Cheesecake cremos cu coulis de fructe de pădure.' },
  { n: 'Tort Pavlova', cat: Category.Tort, p: 95, ing: ['bezea', 'frișcă', 'fructe proaspete'], d: 'Bezea crocantă cu frișcă și fructe proaspete.' },
  { n: 'Tort Tiramisu', cat: Category.Tort, p: 110, ing: ['mascarpone', 'cafea', 'piscoturi', 'cacao'], d: 'Tiramisu autentic cu mascarpone și espresso.' },
  { n: 'Ecler cu ciocolată', cat: Category.Ecler, p: 9, ing: ['aluat opărit', 'cremă de vanilie', 'glazură de ciocolată'], d: 'Ecler clasic cu cremă de vanilie și glazură de ciocolată.' },
  { n: 'Ecler cu fistic', cat: Category.Ecler, p: 12, ing: ['aluat opărit', 'cremă de fistic', 'fistic măcinat'], d: 'Cremă fină de fistic într-un ecler aerat.' },
  { n: 'Ecler caramel sărat', cat: Category.Ecler, p: 11, ing: ['aluat opărit', 'caramel', 'sare de mare'], d: 'Caramel sărat onctuos, echilibrat perfect.' },
  { n: 'Choux à la crème', cat: Category.Ecler, p: 8, ing: ['aluat opărit', 'cremă diplomat'], d: 'Choux pufos umplut cu cremă diplomat.' },
  { n: 'Profiterol', cat: Category.Ecler, p: 18, ing: ['choux', 'înghețată', 'sos de ciocolată'], d: 'Choux cu înghețată și sos cald de ciocolată.' },
  { n: 'Croissant cu unt', cat: Category.Croissant, p: 7, ing: ['unt', 'făină', 'drojdie', 'lapte'], d: 'Croissant franțuzesc cu unt, foietat 27 de straturi.' },
  { n: 'Pain au chocolat', cat: Category.Croissant, p: 9, ing: ['unt', 'ciocolată neagră', 'făină'], d: 'Foietaj cu baton de ciocolată belgiană.' },
  { n: 'Croissant cu migdale', cat: Category.Croissant, p: 11, ing: ['unt', 'cremă de migdale', 'migdale feliate'], d: 'Croissant umplut cu frangipane și migdale.' },
  { n: 'Croissant cu zmeură', cat: Category.Croissant, p: 10, ing: ['unt', 'gem de zmeură', 'zahăr pudră'], d: 'Foietaj fraged cu gem de zmeură.' },
  { n: 'Prăjitură Amandină', cat: Category.Prajitura, p: 8, ing: ['ciocolată', 'sirop de rom', 'cremă de unt'], d: 'Amandina clasică, însiropată și glazurată.' },
  { n: 'Cremșnit', cat: Category.Prajitura, p: 9, ing: ['foietaj', 'cremă de vanilie', 'zahăr pudră'], d: 'Cremă de vanilie densă între două foi crocante.' },
  { n: 'Savarină', cat: Category.Prajitura, p: 7, ing: ['aluat însiropat', 'frișcă', 'sirop'], d: 'Savarină pufoasă, bine însiropată, cu frișcă.' },
  { n: 'Negresă', cat: Category.Prajitura, p: 6, ing: ['ciocolată', 'nucă', 'unt'], d: 'Brownie dens cu nucă și ciocolată.' },
  { n: 'Tiramisu la pahar', cat: Category.Prajitura, p: 14, ing: ['mascarpone', 'cafea', 'piscoturi', 'cacao'], d: 'Porție individuală de tiramisu cremos.' },
  { n: 'Baclava', cat: Category.Prajitura, p: 8, ing: ['foietaj filo', 'nuci', 'miere', 'sirop'], d: 'Baclava cu nuci și sirop de miere.' },
  { n: 'Prăjitură cu mac', cat: Category.Prajitura, p: 7, ing: ['mac', 'lămâie', 'ouă', 'unt'], d: 'Blat aromat cu mac și coajă de lămâie.' },
  { n: 'Tartă cu fructe', cat: Category.Tarta, p: 16, ing: ['aluat fraged', 'cremă patiserie', 'fructe proaspete'], d: 'Tartă cu cremă de vanilie și fructe de sezon.' },
  { n: 'Tartă cu lămâie', cat: Category.Tarta, p: 15, ing: ['aluat fraged', 'lemon curd', 'bezea'], d: 'Lemon curd acrișor sub o bezea ușor caramelizată.' },
  { n: 'Tartă cu ciocolată', cat: Category.Tarta, p: 17, ing: ['aluat de cacao', 'ganache', 'sare de mare'], d: 'Ganache intens de ciocolată cu un vârf de sare.' },
  { n: 'Tarte Tatin', cat: Category.Tarta, p: 18, ing: ['mere', 'caramel', 'foietaj'], d: 'Tartă răsturnată cu mere caramelizate.' },
  { n: 'Tartă cu nucă pecan', cat: Category.Tarta, p: 19, ing: ['nucă pecan', 'sirop de arțar', 'unt'], d: 'Pecan pie cu sirop de arțar.' },
];

const VEGAN_PRODUCTS: Tpl[] = [
  { n: 'Tort vegan de ciocolată', cat: Category.Tort, p: 130, ing: ['ciocolată neagră', 'lapte de cocos', 'făină integrală', 'sirop de agave'], d: '100% vegan, fără ou și lapte, cu ciocolată belgiană.' },
  { n: 'Cheesecake vegan cu zmeură', cat: Category.Tort, p: 40, ing: ['caju', 'lapte de cocos', 'zmeură', 'sirop de arțar'], d: 'Raw cheesecake din caju, fără coacere.' },
  { n: 'Ecler vegan cu vanilie', cat: Category.Ecler, p: 12, ing: ['aquafaba', 'lapte vegetal', 'vanilie', 'margarină vegetală'], d: 'Ecler fără produse animale, cu cremă de vanilie vegetală.' },
  { n: 'Croissant vegan', cat: Category.Croissant, p: 9, ing: ['margarină vegetală', 'făină', 'lapte de soia'], d: 'Foietaj vegan, la fel de fraged ca cel clasic.' },
  { n: 'Brownie vegan', cat: Category.Prajitura, p: 8, ing: ['avocado', 'cacao', 'nucă', 'curmale'], d: 'Brownie dens, vegan, îndulcit cu curmale.' },
  { n: 'Tartă vegană cu fructe', cat: Category.Tarta, p: 16, ing: ['aluat vegan', 'cremă de cocos', 'fructe proaspete'], d: 'Tartă vegană cu cremă de cocos și fructe.' },
];

const FIRST = ['Andrei', 'Maria', 'Ioana', 'Mihai', 'Elena', 'Alexandru', 'Andreea', 'Cristian', 'Gabriela', 'Ștefan', 'Raluca', 'Bogdan', 'Diana', 'Vlad', 'Roxana', 'Cătălin', 'Simona', 'Adrian', 'Larisa', 'Daniel', 'Oana', 'Florin', 'Bianca', 'Tudor', 'Anca', 'Sorin', 'Carmen', 'Răzvan', 'Teodora', 'George', 'Alina', 'Marius', 'Denisa', 'Paul', 'Laura', 'Robert'];
const LAST = ['Popescu', 'Ionescu', 'Pop', 'Radu', 'Stan', 'Dumitru', 'Gheorghe', 'Matei', 'Constantin', 'Marin', 'Mureșan', 'Barbu', 'Toma', 'Neagu', 'Lazăr', 'Munteanu', 'Dragomir', 'Sandu', 'Cojocaru', 'Vasile', 'Florea', 'Tudor', 'Nistor', 'Olaru', 'Iordache'];

const CITY_LINES = [
  'Salutare! Cineva știe unde găsesc cel mai bun tort de ciocolată în oraș?',
  'Recomand cu drag eclerele de la cofetăria din centru, sunt divine 😍',
  'Bună! Caut o cofetărie care face deserturi vegane, aveți idei?',
  'Aaa, abia am luat un croissant cald, ce început de zi 🥐',
  'Cineva a comandat tort de aniversare recent? Cum a fost?',
  'Mulțumesc pentru recomandări, am găsit exact ce căutam!',
  'Mi se pare mie sau prețurile la torturi au cam crescut peste tot?',
  'Pentru botez recomand Cofetăria Regală, au fost super profesioniști.',
  'Caut ceva fără gluten pentru o prietenă, unde găsesc?',
  'Tocmai am descoperit o patiserie nouă, savarinele sunt de nota 10!',
  'Vine cineva la târgul de dulciuri din weekend? 🎪',
  'Aveți o cofetărie preferată pentru tiramisu? Al meu e obsesie 😅',
  'Mersi tuturor, comunitatea asta chiar ajută!',
  'Cine face cele mai bune prăjituri de casă, ca pe vremuri?',
];

const DM_OPENERS = [
  'Bună ziua! Aveți torturi disponibile pentru weekendul acesta?',
  'Salut! Aș dori un tort pentru o aniversare de 30 de ani, ce îmi recomandați?',
  'Bună! Faceți și deserturi vegane? Sunt interesat de eclere.',
  'Bună ziua, aș vrea să comand 20 de eclere pentru un eveniment. E posibil?',
  'Salutare! Cât costă un tort de ciocolată de 2 kg?',
  'Bună! Aveți produse fără gluten în ofertă?',
  'Bună ziua! Se pot ridica produsele mâine dimineață?',
  'Salut! Faceți torturi personalizate cu o anumită temă?',
];
const DM_REPLIES = [
  'Bună ziua! Da, sigur. Pentru ce dată aveți nevoie?',
  'Salut! Vă mulțumim pentru mesaj 😊 Vă putem pregăti cu plăcere.',
  'Bună! Da, avem mai multe opțiuni, vă trimit detaliile imediat.',
  'Desigur! Putem discuta dimensiunea și aromele preferate.',
  'Bună ziua! Prețul depinde de blat și decor, dar pornim de la 130 lei.',
  'Da, avem o gamă fără gluten pregătită zilnic 🙌',
  'Sigur, vă așteptăm! Programul nostru este 8:00 - 20:00.',
  'Cu siguranță! Trimiteți-mi un model și facem o ofertă.',
];
const DM_CLIENT_FOLLOW = [
  'Perfect, mulțumesc mult! Atunci rămâne pentru sâmbătă.',
  'Super, sună foarte bine! Vă confirm până diseară.',
  'Minunat, exact ce căutam. Vă las și un număr de telefon.',
  'Mulțumesc pentru rapiditate, ne vedem atunci!',
  'Excelent, abia aștept să gust 😋',
];

// ── Pentru generarea suplimentară de afaceri în orașele mari ─────────────────
const EXTRA_TARGETS: Record<string, number> = {
  'Cluj-Napoca': 18, 'București': 18, 'Brașov': 17,
};
const NAME_WORDS = [
  'Vanilie', 'Caramel', 'Migdala', 'Bezea', 'Scorțișoara', 'Trandafir', 'Lavanda', 'Ciocolata',
  'Mierea', 'Frișca', 'Cireașa', 'Praline', 'Boema', 'Aroma', 'Marțipan', 'Nuga', 'Cocos',
  'Fistic', 'Afina', 'Zmeura', 'Caisa', 'Piersica', 'Vișina', 'Aluna', 'Crema', 'Visul Dulce',
  'Inima Dulce', 'Colțul Dulce', 'Aurora', 'Délice', 'Douceur', 'Macaron', 'Eleganza',
  'Floarea Dulce', 'Zahărel', 'Cufărul Dulce', 'Rândunica', 'Petale', 'Migdalul', 'Dulce Tentație',
];
const EXTRA_SPEC = [
  'torturi personalizate', 'prăjituri de casă', 'eclere și choux', 'cheesecake artizanal',
  'tarte cu fructe', 'foietaje proaspete', 'macarons franțuzești', 'deserturi fără zahăr',
  'cozonaci tradiționali', 'tiramisu și deserturi italiene', 'baclava și deserturi orientale',
  'torturi de eveniment',
];
const EXTRA_DESC = [
  '{Type} de cartier cu deserturi proaspete, în {city}.',
  'Mică {type} de familie, cu rețete clasice și ingrediente locale, în {city}.',
  'Deserturi artizanale și torturi la comandă, în inima orașului {city}.',
  '{Type} modernă cu accent pe ingrediente naturale, în {city}.',
  'Prăjituri și torturi pregătite zilnic, cu drag, în {city}.',
  'Atmosferă caldă și dulciuri fine, o {type} dragă clienților din {city}.',
  '{Type} boutique cu un meniu mic, dar atent selecționat, în {city}.',
  'Tradiție și creativitate — o {type} de încredere din {city}.',
];

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger('SeedService');

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectModel(Message.name) private readonly messageModel: Model<Message>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedMain();
    await this.seedExtraCities();
  }

  private async seedMain() {
    try {
      // Idempotență: dacă există deja multe afaceri demo, nu mai semănăm.
      const seededBiz = await this.userRepo
        .createQueryBuilder('u')
        .where('u.isDemo = :d', { d: true })
        .andWhere("u.businessName != :na", { na: 'N/A' })
        .getCount();
      if (seededBiz > 5) {
        this.logger.log(`Seed demo deja prezent (${seededBiz} afaceri). Sar peste.`);
        return;
      }

      const roleAdmin = await this.roleRepo.findOne({ where: { name: 'ADMIN' } });
      const roleUser = await this.roleRepo.findOne({ where: { name: 'NORMAL_USER' } });
      if (!roleAdmin || !roleUser) {
        this.logger.warn('Rolurile nu există încă — sar peste seed.');
        return;
      }

      const pass = await bcrypt.hash('parola123', await bcrypt.genSalt(10));
      this.logger.log('Pornesc popularea bazei de date demo…');

      // ── 1. Afaceri (proprietari = ADMIN) ────────────────────────────────────
      const bizEntities = BUSINESSES.map((b, i) =>
        this.userRepo.create({
          firstName: b.o[0], lastName: b.o[1],
          email: `${slug(b.n)}@dulcedemo.ro`,
          password: pass,
          businessName: b.n, businessType: b.t, county: b.c,
          phone: `07${rint(20, 49)} ${rint(100, 999)} ${rint(100, 999)}`,
          description: b.d,
          productionScale: b.scale,
          dietaryOptions: b.diet.length ? b.diet : undefined,
          specialties: b.spec,
          role: roleAdmin, isDemo: true,
        }),
      );
      const businesses = await this.userRepo.save(bizEntities);

      // ── 2. Clienți (NORMAL_USER) ────────────────────────────────────────────
      const cities = [...new Set(BUSINESSES.map((b) => b.c))];
      const usedEmails = new Set<string>();
      const clientEntities: User[] = [];
      for (let i = 0; i < 36; i++) {
        const fn = pick(FIRST); const ln = pick(LAST);
        let email = `${slug(fn)}.${slug(ln)}@dulcedemo.ro`;
        if (usedEmails.has(email)) email = `${slug(fn)}.${slug(ln)}${i}@dulcedemo.ro`;
        usedEmails.add(email);
        clientEntities.push(this.userRepo.create({
          firstName: fn, lastName: ln, email, password: pass,
          businessName: 'N/A', businessType: 'Altele', county: pick(cities),
          role: roleUser, isDemo: true,
        }));
      }
      const clients = await this.userRepo.save(clientEntities);

      // ── 3. Produse per afacere ──────────────────────────────────────────────
      const allProducts: Product[] = [];
      const byBusiness = new Map<string, Product[]>();
      for (const biz of businesses) {
        const isVegan = (BUSINESSES.find((b) => b.n === biz.businessName)?.diet ?? []).includes('Vegan');
        const pool = isVegan ? [...PRODUCTS, ...VEGAN_PRODUCTS] : PRODUCTS;
        const chosen = pickN(pool, rint(7, 12));
        if (isVegan) chosen.push(...pickN(VEGAN_PRODUCTS, rint(2, 3)));
        const prods = chosen.map((t) => {
          const made = rint(0, 3);
          return this.productRepo.create({
            userId: biz.id,
            name: t.n, category: t.cat,
            pricePerUnit: Math.round((t.p * (0.9 + Math.random() * 0.3)) * 100) / 100,
            stock: chance(0.12) ? 0 : rint(4, 60),
            description: t.d,
            ingredients: t.ing,
            manufactureDate: dayStr(-made),
            expiryDate: dayStr(rint(2, 21)),
            isActive: chance(0.92),
          });
        });
        const saved = await this.productRepo.save(prods);
        allProducts.push(...saved);
        byBusiness.set(biz.id, saved);
      }

      // ── 4. Comenzi per afacere ──────────────────────────────────────────────
      const statusBag: OrderStatus[] = [
        OrderStatus.PENDING, OrderStatus.PENDING,
        OrderStatus.CONFIRMED, OrderStatus.CONFIRMED,
        OrderStatus.COMPLETED, OrderStatus.COMPLETED, OrderStatus.COMPLETED,
        OrderStatus.CANCELLED,
      ];
      const orderEntities: Order[] = [];
      for (const biz of businesses) {
        const prods = (byBusiness.get(biz.id) ?? []).filter((p) => p.isActive);
        if (prods.length === 0) continue;
        for (let k = 0; k < rint(2, 5); k++) {
          const customer = pick(clients);
          const items = pickN(prods, rint(1, 4)).map((p) => {
            const quantity = rint(1, 3);
            const unitPrice = p.pricePerUnit;
            return { productId: p.id, quantity, unitPrice, subtotal: Math.round(unitPrice * quantity * 100) / 100 } as OrderItem;
          });
          const totalValue = Math.round(items.reduce((s, it) => s + it.subtotal, 0) * 100) / 100;
          const totalItems = items.reduce((s, it) => s + it.quantity, 0);
          orderEntities.push(this.orderRepo.create({
            userId: biz.id,
            customerName: `${customer.firstName} ${customer.lastName}`,
            customerPhone: `07${rint(20, 49)} ${rint(100, 999)} ${rint(100, 999)}`,
            notes: chance(0.3) ? pick(['Fără alune, vă rog.', 'De ridicat la ora 14:00.', 'Cu mesaj pe tort.', 'Ambalat cadou.']) : undefined,
            status: pick(statusBag),
            items, totalValue, totalItems,
          }));
        }
      }
      await this.orderRepo.save(orderEntities);

      // ── 5. Conversații (MongoDB) ────────────────────────────────────────────
      const msgs: any[] = [];
      const clientsByCity = new Map<string, User[]>();
      for (const c of clients) {
        const arr = clientsByCity.get(c.county) ?? [];
        arr.push(c); clientsByCity.set(c.county, arr);
      }

      // Chat pe oraș
      for (const city of cities) {
        const bizHere = businesses.filter((b) => b.county === city);
        const cliHere = clientsByCity.get(city) ?? [];
        const people = [...cliHere, ...bizHere];
        if (people.length < 2) continue;
        let t = Date.now() - rint(2, 9) * 864e5;
        const count = rint(6, 11);
        for (let i = 0; i < count; i++) {
          const sender = pick(people);
          const isBiz = sender.businessName !== 'N/A';
          msgs.push({
            room: `city:${city}`, kind: 'CITY',
            senderId: sender.id, senderName: isBiz ? sender.businessName : sender.firstName,
            senderRole: isBiz ? 'BUSINESS' : 'CLIENT',
            text: pick(CITY_LINES), createdAt: new Date(t),
          });
          t += rint(60_000, 1_800_000);
        }
      }

      // Conversații directe (DM) client ↔ afacere
      for (let i = 0; i < 22; i++) {
        const biz = pick(businesses);
        const localClients = clientsByCity.get(biz.county) ?? clients;
        const client = pick(localClients.length ? localClients : clients);
        const room = `dm:${biz.id}:${client.id}`;
        let t = Date.now() - rint(1, 8) * 864e5;
        const turns = rint(3, 7);
        for (let k = 0; k < turns; k++) {
          const fromClient = k % 2 === 0;
          const text = k === 0 ? pick(DM_OPENERS) : fromClient ? pick(DM_CLIENT_FOLLOW) : pick(DM_REPLIES);
          msgs.push({
            room, kind: 'DM',
            businessId: biz.id, businessName: biz.businessName,
            clientId: client.id, clientName: client.firstName,
            senderId: fromClient ? client.id : biz.id,
            senderName: fromClient ? client.firstName : biz.businessName,
            senderRole: fromClient ? 'CLIENT' : 'BUSINESS',
            text, createdAt: new Date(t),
          });
          t += rint(120_000, 3_600_000);
        }
      }

      await this.messageModel.insertMany(msgs, { timestamps: false });

      this.logger.log(
        `Seed demo gata: ${businesses.length} afaceri, ${clients.length} clienți, ` +
        `${allProducts.length} produse, ${orderEntities.length} comenzi, ${msgs.length} mesaje.`,
      );
    } catch (err) {
      this.logger.error('Seed demo a eșuat', err as Error);
    }
  }

  // ── Extra: mai multe afaceri în orașele mari (top-up idempotent) ────────────
  private async seedExtraCities() {
    try {
      const roleAdmin = await this.roleRepo.findOne({ where: { name: 'ADMIN' } });
      if (!roleAdmin) return;

      // Nume deja folosite (din pool + din BD) pentru a evita duplicatele.
      const used = new Set<string>(BUSINESSES.map((b) => b.n));
      const existing = await this.userRepo.find({ where: { isDemo: true }, select: ['businessName'] });
      existing.forEach((u) => used.add(u.businessName));

      const pass = await bcrypt.hash('parola123', await bcrypt.genSalt(10));
      let totalAdded = 0;

      for (const [city, target] of Object.entries(EXTRA_TARGETS)) {
        const current = await this.userRepo.createQueryBuilder('u')
          .where('u.isDemo = :d', { d: true })
          .andWhere('u.businessName != :na', { na: 'N/A' })
          .andWhere('u.county = :c', { c: city })
          .getCount();
        const toAdd = Math.max(0, target - current);
        if (toAdd === 0) continue;

        const newBiz: User[] = [];
        for (let i = 0; i < toAdd; i++) {
          const name = this.uniqueBizName(used);
          const type = pick(['Cofetărie', 'Patiserie', 'Brutărie']);
          const diet = chance(0.3) ? pickN(['Vegan', 'Vegetarian', 'Fără gluten', 'Fără lactoză'], rint(1, 2)) : [];
          const desc = pick(EXTRA_DESC)
            .replace(/{Type}/g, type)
            .replace(/{type}/g, type.toLowerCase())
            .replace(/{city}/g, city);
          newBiz.push(this.userRepo.create({
            firstName: pick(FIRST), lastName: pick(LAST),
            email: `${slug(name)}-${slug(city)}-${i}@dulcedemo.ro`,
            password: pass,
            businessName: name, businessType: type, county: city,
            phone: `07${rint(20, 49)} ${rint(100, 999)} ${rint(100, 999)}`,
            description: desc,
            productionScale: pick(['Casă', 'Scară mică', 'Scară mică', 'Scară mare']),
            dietaryOptions: diet.length ? diet : undefined,
            specialties: pick(EXTRA_SPEC),
            role: roleAdmin, isDemo: true,
          }));
        }
        const saved = await this.userRepo.save(newBiz);

        // Produse pentru fiecare afacere nouă.
        for (const biz of saved) {
          const isVegan = (biz.dietaryOptions ?? []).includes('Vegan');
          await this.productRepo.save(this.makeProducts(biz.id, isVegan));
        }

        // Câteva comenzi pentru fiecare (customerName = nume aleator).
        const orders: Order[] = [];
        for (const biz of saved) {
          const prods = await this.productRepo.find({ where: { userId: biz.id, isActive: true } });
          if (!prods.length) continue;
          for (let k = 0; k < rint(1, 4); k++) {
            const items = pickN(prods, rint(1, 3)).map((p) => {
              const quantity = rint(1, 3);
              return { productId: p.id, quantity, unitPrice: p.pricePerUnit, subtotal: Math.round(p.pricePerUnit * quantity * 100) / 100 } as OrderItem;
            });
            orders.push(this.orderRepo.create({
              userId: biz.id,
              customerName: `${pick(FIRST)} ${pick(LAST)}`,
              customerPhone: `07${rint(20, 49)} ${rint(100, 999)} ${rint(100, 999)}`,
              status: pick([OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.COMPLETED, OrderStatus.COMPLETED, OrderStatus.CANCELLED]),
              items,
              totalValue: Math.round(items.reduce((s, it) => s + it.subtotal, 0) * 100) / 100,
              totalItems: items.reduce((s, it) => s + it.quantity, 0),
            }));
          }
        }
        if (orders.length) await this.orderRepo.save(orders);

        totalAdded += saved.length;
        this.logger.log(`Extra: +${saved.length} afaceri în ${city} (țintă ${target}).`);
      }

      if (totalAdded) this.logger.log(`Seed extra gata: +${totalAdded} afaceri în orașele mari.`);
    } catch (err) {
      this.logger.error('Seed extra a eșuat', err as Error);
    }
  }

  private makeProducts(userId: string, isVegan: boolean): Product[] {
    const pool = isVegan ? [...PRODUCTS, ...VEGAN_PRODUCTS] : PRODUCTS;
    const chosen = pickN(pool, rint(7, 12));
    if (isVegan) chosen.push(...pickN(VEGAN_PRODUCTS, rint(2, 3)));
    return chosen.map((t) => this.productRepo.create({
      userId,
      name: t.n, category: t.cat,
      pricePerUnit: Math.round((t.p * (0.9 + Math.random() * 0.3)) * 100) / 100,
      stock: chance(0.12) ? 0 : rint(4, 60),
      description: t.d, ingredients: t.ing,
      manufactureDate: dayStr(-rint(0, 3)), expiryDate: dayStr(rint(2, 21)),
      isActive: chance(0.92),
    }));
  }

  private uniqueBizName(used: Set<string>): string {
    for (let tries = 0; tries < 200; tries++) {
      const w = pick(NAME_WORDS);
      const p = rnd(10);
      const name = p < 5 ? `${pick(['Cofetăria', 'Patiseria', 'Brutăria'])} ${w}`
        : p < 7 ? `Maison ${w}`
        : p < 9 ? `Sweet ${w}`
        : `La ${w}`;
      if (!used.has(name)) { used.add(name); return name; }
    }
    const fb = `Cofetăria ${pick(NAME_WORDS)} ${rint(1, 9999)}`;
    used.add(fb); return fb;
  }
}
