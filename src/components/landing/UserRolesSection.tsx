import { Check, Shield, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { userRolesContent } from '@/data/landing'

export function UserRolesSection() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 md:py-20">
      <div className="max-w-2xl">
        <p className="inline-flex items-center rounded-full border border-emerald/20 bg-emerald/8 px-3.5 py-1 text-[11px] font-semibold tracking-[0.08em] text-emerald-dark uppercase">
          {userRolesContent.eyebrow}
        </p>
        <h2 className="mt-4 text-[32px] leading-[1.15] font-bold tracking-[-0.03em] text-navy sm:text-[40px]">
          {userRolesContent.heading}
        </h2>
        <p className="mt-4 text-[15.5px] leading-7 text-muted">
          {userRolesContent.subtitle}
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
        {userRolesContent.roles.map((role) => {
          const isOrganiser = role.name === 'ORGANISER'

          return (
            <div
              key={role.name}
              className="flex flex-col justify-between rounded-[16px] border border-border bg-card p-6 shadow-(--shadow-card) transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald/30"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-[10px] ${
                        isOrganiser
                          ? 'bg-navy text-white'
                          : 'bg-emerald/10 text-emerald-dark'
                      }`}
                    >
                      {isOrganiser ? (
                        <Shield className="h-5 w-5" />
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-[17px] font-bold tracking-tight text-navy">
                        {role.name}
                      </h3>
                      <p className="text-[12px] font-medium text-muted">
                        {role.badge}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
                      isOrganiser
                        ? 'border border-navy/20 bg-navy/5 text-navy'
                        : 'border border-emerald/20 bg-emerald/10 text-emerald-dark'
                    }`}
                  >
                    {isOrganiser ? 'Custodian' : 'Participant'}
                  </span>
                </div>

                <p className="mt-4 text-[13.5px] leading-relaxed text-muted">
                  {role.description}
                </p>

                <ul className="mt-6 space-y-3">
                  {role.responsibilities.map((resp) => (
                    <li
                      key={resp}
                      className="flex items-center gap-2.5 text-[13.5px] text-navy"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald/15 text-emerald-dark">
                        <Check className="h-3 w-3 stroke-[2.5]" />
                      </span>
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 border-t border-border/70 pt-4 text-[12px] font-medium text-muted flex items-center justify-between">
                <span>
                  {isOrganiser
                    ? 'Access to administration, audit ledgers, and live auctions'
                    : 'Instant access from mobile or desktop browser'}
                </span>
                {isOrganiser && (
                  <Link
                    to="/subscription"
                    className="inline-flex items-center gap-1 text-[12px] font-bold text-emerald hover:underline shrink-0 ml-2"
                  >
                    <span>Organize & Subscribe →</span>
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
