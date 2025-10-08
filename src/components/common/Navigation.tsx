import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

const navItems = [
  { path: '/', label: '홈' },
  { path: '/words', label: '단어 관리' },
  { path: '/quiz', label: '오늘 시험' },
  { path: '/review', label: '복습' },
  { path: '/import-export', label: '데이터 관리' },
  { path: '/admin', label: '통계' },
]

export default function Navigation() {
  const location = useLocation()

  return (
    <nav className="border-b">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-xl font-bold">
            VocaBokum
          </Link>
          <ul className="flex gap-6">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-primary',
                    location.pathname === item.path
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  )
}
