function PageHeader({ title, description, action }) {
  return (
    <header className="clients-header">
      <div>
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {action}
    </header>
  );
}

export default PageHeader;
