import { Check, X } from 'lucide-react'

// Password strength criteria
const criteria = [
  { key: 'length', label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { key: 'uppercase', label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { key: 'lowercase', label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
  { key: 'number', label: 'One number', test: (p) => /[0-9]/.test(p) },
  { key: 'special', label: 'One special character (!@#$%)', test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
]

export function getPasswordStrength(password) {
  if (!password) return { score: 0, level: 'none', passed: [] }
  
  const passed = criteria.filter(c => c.test(password)).map(c => c.key)
  const score = passed.length
  
  let level = 'weak'
  if (score >= 5) level = 'strong'
  else if (score >= 4) level = 'good'
  else if (score >= 3) level = 'fair'
  
  return { score, level, passed }
}

export function isPasswordStrong(password) {
  const { score } = getPasswordStrength(password)
  return score >= 4 // At least 4 out of 5 criteria
}

export default function PasswordStrength({ password }) {
  const { level, passed } = getPasswordStrength(password)
  
  if (!password) return null
  
  const colors = {
    weak: 'bg-red-500',
    fair: 'bg-orange-500',
    good: 'bg-yellow-500',
    strong: 'bg-green-500',
  }
  
  const textColors = {
    weak: 'text-red-600',
    fair: 'text-orange-600',
    good: 'text-yellow-600',
    strong: 'text-green-600',
  }
  
  const widths = {
    weak: 'w-1/4',
    fair: 'w-2/4',
    good: 'w-3/4',
    strong: 'w-full',
  }
  
  return (
    <div className="mt-2 space-y-2">
      {/* Strength Bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className={`h-full transition-all duration-300 ${colors[level]} ${widths[level]}`} />
        </div>
        <span className={`text-xs font-medium capitalize ${textColors[level]}`}>{level}</span>
      </div>
      
      {/* Criteria Checklist */}
      <div className="grid grid-cols-2 gap-1">
        {criteria.map(({ key, label }) => {
          const isPassed = passed.includes(key)
          return (
            <div key={key} className={`flex items-center gap-1.5 text-xs ${isPassed ? 'text-green-600' : 'text-text-muted'}`}>
              {isPassed ? <Check size={12} /> : <X size={12} />}
              <span>{label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
