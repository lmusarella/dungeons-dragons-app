export function weaponForAttackRange(weapon, range) {
  const original = weapon.weapon_range || (weapon.range_normal ? 'ranged' : 'melee');
  return { ...weapon, weapon_range: range, attack_ability: weapon.attack_ability || (original === 'ranged' ? 'dex' : 'str') };
}
export function weaponAttackVariants(weapon) {
  const range = weapon.weapon_range || (weapon.range_normal ? 'ranged' : 'melee');
  return (range === 'melee' && weapon.is_thrown ? ['melee', 'ranged'] : [range]).map(entry => weaponForAttackRange(weapon, entry));
}
