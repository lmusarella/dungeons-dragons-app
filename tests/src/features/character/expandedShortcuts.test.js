import {describe,it,expect} from 'vitest';
import {buildResourceFacts} from '../../../../src/features/character/home/resourceFacts.js';
import {buildAttackSection} from '../../../../src/features/character/home/sections.js';
import {readFileSync} from 'node:fs';
describe('expanded shortcut reference',()=>{
  it('summarizes actual resource values and recovery without assuming missing data',()=>{
    const html=buildResourceFacts({max_uses:3,used:1,cast_time:'Reazione',reset_on:'long_rest',damage_dice_notation:'2d6',damage_modifier:2});
    expect(html).toContain('2 / 3');
    expect(html).toContain('Riposo lungo');
    expect(html).toContain('2d6 +2');
    expect(html).not.toContain('Costo');
  });
  it('escapes custom descriptions and hides empty recovery values',()=>{
    const html=buildResourceFacts({cast_time:'<script>',recovery_short:0});
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('Recupero breve');
  });
  it('expresses pool recovery as a percentage and keeps its progress in play cards',()=>{
    const html=buildResourceFacts({resource_type:'pool',max_uses:20,used:5,recovery_short:5,recovery_long:20});
    const cards=readFileSync('src/features/character/home/playCards.js','utf8');
    expect(html).toContain('<dd>25%</dd>');
    expect(html).toContain('<dd>100%</dd>');
    expect(html).not.toContain('cariche');
    expect(cards).toContain("poolProgress.className = 'play-card__pool-progress'");
    expect(cards).toContain("poolLine.className = 'play-card__pool-line'");
    expect(cards).toContain("'play-card__pool-percent'");
    expect(cards).toContain('if (count && !pool)');
  });
  it('renders a weapon image only for supported image URLs',()=>{
    const character={data:{abilities:{str:16}}};
    const item={id:'w',name:'Arma',category:'weapon',equipable:true,equip_slots:['main-hand'],weapon_range:'melee',image_url:'https://example.com/sword.png'};
    expect(buildAttackSection(character,[item])).toContain('data-attack-item-image');
    expect(buildAttackSection(character,[{...item,image_url:'javascript:alert(1)'}])).not.toContain('data-attack-item-image');
  });
  it('keeps parent ability cards option-first and exposes the eight-action footer',()=>{
    const cards=readFileSync('src/features/character/home/playCards.js','utf8');
    const layout=readFileSync('src/features/character/home/tabletLayout.js','utf8');
    const styles=readFileSync('src/features/character/home/fantasyTheme.css','utf8');
    expect(cards).toContain('if (dice && !options)');
    expect(cards).toContain("options ? 'Scegli opzione'");
    ['Danno','Cura','Dadi','Riposo breve','Riposo lungo','Paga','Ricevi','Loot rapido'].forEach(label=>expect(layout).toContain(`'${label}'`));
    expect(layout).toContain("toolbar.className = 'sheet-quickbar sheet-action-footer'");
    expect(layout).toContain("toolbar.dataset.sheetActionFooter = ''");
    expect(layout).toContain("button.dataset.gameAction = ''");
    expect(layout).toContain('layout.after(toolbar)');
    expect(layout).not.toContain('layout.append(toolbar)');
    expect(styles).toContain('grid-template-columns: minmax(0,1fr); grid-template-rows: minmax(0,1fr) auto');
    expect(styles).toContain('grid-column: 1 !important; grid-row: 2');
  });
  it('surfaces saving throws and labeled weapon facts in shortcut card footers',()=>{
    const sections=readFileSync('src/features/character/home/sections.js','utf8');
    const cards=readFileSync('src/features/character/home/playCards.js','utf8');
    const styles=readFileSync('src/features/character/home/fantasyTheme.css','utf8');
    expect(sections).toContain('data-resource-saving-throw');
    expect(sections).toContain('data-spell-saving-throw');
    expect(cards).toContain('savingThrowInfo(card.dataset.resourceSavingThrow)');
    expect(cards).toContain('savingThrowInfo(card.dataset.spellSavingThrow)');
    expect(cards).toContain("weaponFact('Gittata', rangeLabel)");
    expect(cards).toContain("weaponFact(ammoLabel, ammoValue)");
    expect(cards).toContain("weaponFact('Impugnatura', gripLabel)");
    expect(styles).toContain('.play-card__saving-throw');
    expect(styles).toContain('.play-card__weapon-fact');
  });
  it('unifies consumable and always-active powers under one sticky filter',()=>{
    const sections=readFileSync('src/features/character/home/sections.js','utf8');
    const cards=readFileSync('src/features/character/home/playCards.js','utf8');
    const catalog=readFileSync('src/features/character/home/catalogLayout.js','utf8');
    const styles=readFileSync('src/features/character/home/fantasyTheme.css','utf8');
    expect(sections).toContain('data-resource-damage-type');
    expect(cards).toContain("if (castTime)");
    expect(cards).toContain("card.dataset.resourceAction = castTime || ''");
    expect(cards).toContain("card.dataset.resourceKind = isAlwaysActive ? 'always' : 'consumable'");
    expect(cards).toContain('appendDamageTypeLabel(diceAction, damageType)');
    expect(cards).toContain('appendDamageTypeLabel(damageAction, spellDamageType)');
    expect(cards).toContain("footer.addEventListener('click', (event) => event.stopPropagation())");
    expect(catalog).toContain("grid.className = 'resource-list resource-list--compact resource-catalog-grid'");
    expect(styles).toContain(".catalog-page > .resource-action-filters");
    expect(styles).toContain('position: sticky; top: 0;');
    expect(styles).toContain('.resource-kind-filters');
    expect(styles).toContain('.play-card__button-damage-type');
  });
  it('keeps saving throws only in the spell footer, not in facts or detail metadata',()=>{
    const sections=readFileSync('src/features/character/home/sections.js','utf8');
    const cards=readFileSync('src/features/character/home/playCards.js','utf8');
    const modals=readFileSync('src/features/character/home/modals.js','utf8');
    expect(sections).toContain("[['Tempo', spell.cast_time], ['Gittata', spell.range], ['Componenti', spell.components], ['Durata', spell.duration]]");
    expect(sections).toContain('data-spell-damage-type');
    expect(cards).toContain('savingThrowInfo(card.dataset.spellSavingThrow)');
    expect(modals).not.toContain("<dt>Tiro salvezza</dt>");
    expect(modals).not.toContain("<dt>Tipo di danno</dt>");
  });
  it('adds the active character name to every root shortcut title',()=>{
    const home=readFileSync('src/features/character/home.js','utf8');
    const layout=readFileSync('src/features/character/home/tabletLayout.js','utf8');
    expect(home).toContain("characterName: activeCharacter?.name || ''");
    expect(layout).toContain('const dialogTitle = characterName ? `${title} di ${characterName}` : title');
    expect(layout).toContain('heading.textContent = dialogTitle');
  });
  it('styles lateral shortcuts as compact command menus matching the footer shell',()=>{
    const layout=readFileSync('src/features/character/home/tabletLayout.js','utf8');
    const sections=readFileSync('src/features/character/home/sections.js','utf8');
    const styles=readFileSync('src/features/character/home/fantasyTheme.css','utf8');
    expect(layout).not.toContain("'Competenze', 'Lingue e competenze extra'");
    expect(layout).not.toContain('proficiencyShortcut');
    expect(sections).toContain('character-proficiency-section');
    expect(styles).toContain('.character-proficiency-section .proficiency-tab-bar');
    expect(styles).toContain(".home-layout.sheet-dashboard :is(.sheet-shortcuts--left,.sheet-shortcuts--right)");
    expect(styles).toContain('background: rgba(251,244,230,.96)');
    expect(styles).toContain('border-radius: 20px');
  });
  it('uses contextual loaders and integrates the transaction ledger below coins',()=>{
    const inventory=readFileSync('src/features/character/home/inventoryShortcut.js','utf8');
    const views=readFileSync('src/features/character/home/shortcutViews.js','utf8');
    const styles=readFileSync('src/features/character/home/fantasyTheme.css','utf8');
    expect(inventory).toContain("showShortcutLoader(host, 'Caricamento inventario')");
    expect(views).toContain('export function showShortcutLoader');
    expect(views).toContain("host.closest('.modal-body') || host");
    expect(views).toContain("moneyPage.append(wallet, transactions)");
    expect(views).not.toContain("{ key: 'transactions', label: 'Transazioni'");
    expect(styles).toContain('.shortcut-context-loader__spinner');
    expect(styles).toContain('.inventory-money-workspace');
  });
  it('keeps spell slot charges circular and easy to scan',()=>{
    const styles=readFileSync('src/features/character/home/fantasyTheme.css','utf8');
    expect(styles).toContain('flex: 0 0 15px');
    expect(styles).toContain('aspect-ratio: 1');
    expect(styles).toContain('border-radius: 50% !important');
  });
  it('filters skill cards by proficiency rank without a redundant hint',()=>{
    const sections=readFileSync('src/features/character/home/sections.js','utf8');
    const groups=readFileSync('src/features/character/home/skillGroups.js','utf8');
    const layout=readFileSync('src/features/character/home/tabletLayout.js','utf8');
    const styles=readFileSync('src/features/character/home/fantasyTheme.css','utf8');
    expect(sections).toContain('data-skill-rank="${rank}" data-skill-ability="${skill.ability}"');
    expect(sections).toContain('data-skill-rank="${rank}" data-skill-ability="${abilityKey}"');
    expect(groups).toContain('export function installSkillRankFilters');
    ['Competenza','Maestria','FOR','DES','COS','INT','SAG','CAR'].forEach(label=>expect(groups).toContain(`'${label}'`));
    expect(groups).not.toContain("['untrained', 'Non competenza']");
    expect(groups).toContain("activeRank = activeRank === value ? '' : value");
    expect(groups).toContain("activeAbility = activeAbility === value ? '' : value");
    expect(groups).toContain("buildDivisionHeader('Tiri speciali'");
    expect(groups).not.toContain("button.setAttribute('role','tab')");
    expect(layout).toContain("if (title === 'Tiri Abilità') installSkillRankFilters(node)");
    expect(layout).not.toContain('Scegli una prova per aprire il tiro. Il bonus è già calcolato.');
    expect(styles).toContain('.skill-filter-toolbar');
    expect(styles).toContain('.skill-card.is-filtered-out');
    expect(styles).toContain('flex-direction: column; align-items: center; justify-content: center');
  });
});
