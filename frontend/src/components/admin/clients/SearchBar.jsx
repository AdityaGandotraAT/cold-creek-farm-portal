import { Icon } from '../AdminIcons.jsx';

function SearchBar({
  id = 'client-search',
  value,
  onChange,
  placeholder = 'Search by name, email, or booking number',
}) {
  return (
    <label className="clients-search" htmlFor={id}>
      <span className="clients-search__label">Search</span>
      <span className="clients-search__field">
        <Icon name="search" />
        <input
          id={id}
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
      </span>
    </label>
  );
}

export default SearchBar;
