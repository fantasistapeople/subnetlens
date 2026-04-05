export default function CopyToast({ visible }) {
  return (
    <div className={`copy-toast${visible ? ' show' : ''}`}>
      ✓ Copied to clipboard
    </div>
  )
}
