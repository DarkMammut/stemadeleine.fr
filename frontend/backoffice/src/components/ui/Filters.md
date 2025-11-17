Filters component

Usage:

import Filters from '@/components/ui/Filters';

<Filters
fields={[{ key: 'lastname', label: 'Nom' }, { key: 'firstname', label: 'Prénom' }, { key: 'email', label: 'Email' }]}
onSortChange={(sort) => { /* sort = { field, direction } or { field: null, direction: null } */ }}
onSearch={(q) => { /* q = string */ }}
initialSort={{ field: null, direction: null }}
/>

Notes:

- Le composant s'ouvre via un IconButton et affiche une SearchBar contrôlée.
- Le tri fonctionne en toggle: champ différent => asc, même champ => asc -> desc -> asc.
- Lorsqu'on change de champ, l'icône du champ précédent est retirée.
- Le composant est réutilisable et n'effectue pas lui-même le tri; il émet les changements via `onSortChange`.

