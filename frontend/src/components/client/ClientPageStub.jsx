function ClientPageStub({ title, note }) {
  return (
    <div className="client-stub">
      <p className="client-stub__kicker">Client portal</p>
      <h2>{title}</h2>
      <p>{note || 'This section will be designed next — layout only for now.'}</p>
    </div>
  );
}

export default ClientPageStub;
