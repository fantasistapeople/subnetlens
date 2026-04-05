export default function Footer({ name, portfolioUrl }) {
  return (
    <footer className="footer">
      Built by{' '}
      <a href={portfolioUrl} target="_blank" rel="noopener noreferrer">
        {name}
      </a>
    </footer>
  )
}
