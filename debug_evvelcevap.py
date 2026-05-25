import json
with open('data/katalog.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

null_sinif = [u for u in data['uniteler'] if u.get('sinif_id') is None]
print('Units with null sinif_id: {}/{}'.format(len(null_sinif), len(data['uniteler'])))

ders_kat = {}
for d in data['dersler']:
    kat = next((k for k in data['kategoriler'] if k['id'] == d['kategori_id']), None)
    ders_kat[d['id']] = {'ders': d['baslik'], 'kategori': kat['baslik'] if kat else 'NONE'}

print('\nFirst 20 ders -> kategori:')
for did, info in list(ders_kat.items())[:20]:
    print('  ders[{}]: {} -> kategori: {}'.format(did, info['ders'], info['kategori']))

u = data['uniteler'][0]
d = next((x for x in data['dersler'] if x['id'] == u['ders_id']), None)
k = next((x for x in data['kategoriler'] if x['id'] == d['kategori_id']), None) if d else None
s = next((x for x in data['siniflar'] if x['id'] == u['sinif_id']), None) if u.get('sinif_id') else None
print('\nFirst unit: id={}, baslik={}, ders_id={}, sinif_id={}'.format(u['id'], u['baslik'], u['ders_id'], u.get('sinif_id')))
print('  ders: {} -> kategori: {}'.format(d['baslik'] if d else 'NONE', k['baslik'] if k else 'NONE'))
print('  sinif: {} (id={})'.format(s['baslik'] if s else 'NONE', u.get('sinif_id')))

interactive = [d for d in data['dosyalar'] if d.get('tur') == 'interactive']
if interactive:
    first_id = interactive[0]['unite_id']
    u2 = next((x for x in data['uniteler'] if x['id'] == first_id), None)
    if u2:
        print('\nUnit with interactive: id={}, baslik={}, sinif_id={}'.format(u2['id'], u2['baslik'], u2.get('sinif_id')))
        d2 = next((x for x in data['dersler'] if x['id'] == u2['ders_id']), None)
        k2 = next((x for x in data['kategoriler'] if x['id'] == d2['kategori_id']), None) if d2 else None
        s2 = next((x for x in data['siniflar'] if x['id'] == u2['sinif_id']), None) if u2.get('sinif_id') else None
        print('  ders: {} -> kategori: {}'.format(d2['baslik'] if d2 else 'NONE', k2['baslik'] if k2 else 'NONE'))
        print('  sinif: {}'.format(s2['baslik'] if s2 else 'NONE'))
