function Filter({ id, label, children }) {
  return (
    <label className="clients-filter" htmlFor={id}>
      <span>{label}</span>
      {children}
    </label>
  );
}

export default Filter;
