import Link from "next/link";

export default function NotFound() {
  return <div className="panel empty-state"><h1>Protocol not found</h1><p>The requested local protocol or version does not exist.</p><Link className="button button-primary" href="/protocols">Return to protocols</Link></div>;
}
