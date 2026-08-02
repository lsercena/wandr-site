import { useParams, Link } from 'react-router-dom';
import SeoHead from '@/components/ui/SeoHead';
import ScoreBar from '@/components/ui/ScoreBar';
import { countryService } from '@/services/countryService';
import NotFoundPage from './NotFoundPage';
import './CountryPage.css';

export default function CountryPage() {
  const { slug } = useParams<{ slug: string }>();
  const country = slug ? countryService.getBySlug(slug) : undefined;
  if (!country) return <NotFoundPage />;

  const c = country;
  const sections = [
    { id: 'overview', label: 'Overview' },
    { id: 'visa', label: 'Visa' },
    { id: 'nomad-visa', label: 'Nomad Visa' },
    { id: 'remote-work', label: 'Remote Work' },
    { id: 'housing', label: 'Housing' },
    { id: 'transportation', label: 'Transport' },
    { id: 'healthcare', label: 'Healthcare' },
    { id: 'safety', label: 'Safety' },
    { id: 'weather', label: 'Weather' },
    { id: 'food', label: 'Food' },
    { id: 'banking', label: 'Banking' },
    { id: 'tax', label: 'Tax' },
    { id: 'cost', label: 'Cost of Living' },
  ];

  return (
    <>
      <SeoHead
        title={`${c.name} — Travel Intelligence`}
        description={`Complete guide to ${c.name}: visa requirements, cost of living, digital nomad visa, safety, and remote work info.`}
        path={`/countries/${c.slug}`}
        image={c.image}
      />

      <div className="country-hero" style={{ backgroundImage: `url(${c.image})` }}>
        <div className="country-hero__overlay">
          <div className="container">
            <span className="country-hero__flag">{c.overview.flag}</span>
            <h1>{c.name}</h1>
            <p>{c.tagline}</p>
            <div className="country-hero__badges">
              {c.visa.visaFree && <span className="badge badge-green">Visa-Free</span>}
              {c.digitalNomadVisa.available && <span className="badge badge-terra">Nomad Visa</span>}
              <span className="badge badge-gold">From ${c.costOfLiving.monthlyBudget.budget}/mo</span>
            </div>
          </div>
        </div>
      </div>

      <div className="country-nav">
        <div className="container country-nav__inner">
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="country-nav__link">{s.label}</a>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="container country-content">
          {/* Overview */}
          <section id="overview" className="country-section">
            <h2>Overview</h2>
            <div className="info-grid">
              <InfoItem label="Capital" value={c.overview.capital} />
              <InfoItem label="Currency" value={c.overview.currency} />
              <InfoItem label="Languages" value={c.overview.languages.join(', ')} />
              <InfoItem label="Population" value={c.overview.population} />
              <InfoItem label="Government" value={c.overview.government} />
              <InfoItem label="Timezone" value={c.overview.timezone} />
              <InfoItem label="Driving Side" value={c.overview.drivingSide} />
              <InfoItem label="Power Plugs" value={c.overview.powerPlugs.join(', ')} />
              <InfoItem label="Climate" value={c.overview.climate} />
              <InfoItem label="Best Time to Visit" value={c.overview.bestTimeToVisit.join(', ')} />
              <InfoItem label="Emergency" value={`Police: ${c.overview.emergencyNumbers.police} · Ambulance: ${c.overview.emergencyNumbers.ambulance}`} />
              <InfoItem label="Internet Speed" value={`${c.overview.internetSpeed.download} ${c.overview.internetSpeed.unit} down`} />
            </div>
            <div className="scores-grid">
              <ScoreBar label="Safety" value={c.overview.safetyScore} />
              <ScoreBar label="Family" value={c.overview.familyScore} />
              <ScoreBar label="Solo Travel" value={c.overview.soloTravelerScore} />
              <ScoreBar label="Digital Nomad" value={c.overview.digitalNomadScore} />
              <ScoreBar label="LGBTQ+" value={c.overview.lgbtqFriendliness} />
              <ScoreBar label="English" value={c.overview.englishProficiency} />
            </div>
          </section>

          {/* Visa */}
          <section id="visa" className="country-section">
            <h2>Visa Information</h2>
            <div className="info-grid">
              <InfoItem label="Tourist Visa" value={c.visa.touristVisa} />
              <InfoItem label="Visa Free" value={c.visa.visaFree ? 'Yes' : 'No'} />
              <InfoItem label="Visa Required" value={c.visa.visaRequired ? 'Yes' : 'No'} />
              <InfoItem label="Visa on Arrival" value={c.visa.visaOnArrival ? 'Yes' : 'No'} />
              <InfoItem label="eVisa" value={c.visa.eVisa ? 'Available' : 'Not available'} />
              <InfoItem label="Maximum Stay" value={c.visa.maxStay} />
              <InfoItem label="Extensions" value={c.visa.extensions} />
              <InfoItem label="Visa Runs" value={c.visa.visaRuns} />
              <InfoItem label="Passport Validity" value={c.visa.passportValidity} />
              <InfoItem label="Blank Pages" value={c.visa.blankPages} />
              <InfoItem label="Last Updated" value={c.visa.lastUpdated} />
            </div>
            <ListSection title="Entry Requirements" items={c.visa.entryRequirements} />
            <ListSection title="Required Documents" items={c.visa.requiredDocuments} />
            {c.visa.embassyLinks.length > 0 && (
              <div className="links-section">
                <h3>Official Sources</h3>
                {c.visa.officialSources.map((l) => (
                  <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer">{l.label} ↗</a>
                ))}
              </div>
            )}
          </section>

          {/* Digital Nomad Visa */}
          <section id="nomad-visa" className="country-section">
            <h2>Digital Nomad Visa</h2>
            {c.digitalNomadVisa.available ? (
              <div className="info-grid">
                <InfoItem label="Program" value={c.digitalNomadVisa.name || ''} />
                <InfoItem label="Income Requirement" value={c.digitalNomadVisa.incomeRequirement || 'N/A'} />
                <InfoItem label="Savings Alternative" value={c.digitalNomadVisa.savingsAlternative || 'N/A'} />
                <InfoItem label="Processing Time" value={c.digitalNomadVisa.processingTime || 'N/A'} />
                <InfoItem label="Application Cost" value={c.digitalNomadVisa.applicationCost || 'N/A'} />
                <InfoItem label="Renewal" value={c.digitalNomadVisa.renewal || 'N/A'} />
                <InfoItem label="Family Eligible" value={c.digitalNomadVisa.familyEligibility ? 'Yes' : 'No'} />
                <InfoItem label="Remote Work" value={c.digitalNomadVisa.remoteWorkAllowed ? 'Allowed' : 'Not allowed'} />
                <InfoItem label="Health Insurance" value={c.digitalNomadVisa.healthInsuranceRequired ? `Required (${c.digitalNomadVisa.minimumCoverage})` : 'Not required'} />
                <InfoItem label="Tax Residency Trigger" value={c.digitalNomadVisa.taxResidencyTrigger || 'N/A'} />
                <InfoItem label="Difficulty" value={c.digitalNomadVisa.approvalDifficulty || 'N/A'} />
              </div>
            ) : (
              <p className="country-section__empty">No official digital nomad visa program available. Tourist visa or other residency options may apply.</p>
            )}
          </section>

          {/* Remote Work */}
          <section id="remote-work" className="country-section">
            <h2>Remote Work</h2>
            <div className="info-grid">
              <InfoItem label="Download Speed" value={`${c.remoteWork.internetSpeed.download} Mbps`} />
              <InfoItem label="Upload Speed" value={`${c.remoteWork.internetSpeed.upload} Mbps`} />
              <InfoItem label="Fiber Availability" value={`${c.remoteWork.fiberAvailability}%`} />
              <InfoItem label="5G Coverage" value={`${c.remoteWork.coverage5G}%`} />
              <InfoItem label="Coworking Spaces" value={String(c.remoteWork.coworkingSpaces)} />
              <InfoItem label="Laptop Cafes" value={String(c.remoteWork.laptopFriendlyCafes)} />
              <InfoItem label="Power Reliability" value={`${c.remoteWork.powerReliability}%`} />
              <InfoItem label="VPN Restrictions" value={c.remoteWork.vpnRestrictions ? 'Yes' : 'No'} />
              <InfoItem label="SIM Providers" value={c.remoteWork.simProviders.join(', ')} />
              <InfoItem label="eSIM Providers" value={c.remoteWork.esimProviders.join(', ')} />
            </div>
          </section>

          {/* Housing */}
          <section id="housing" className="country-section">
            <h2>Housing</h2>
            <div className="info-grid">
              <InfoItem label="Studio Rent" value={`$${c.housing.monthlyRent.studio}/mo`} />
              <InfoItem label="1-Bed Rent" value={`$${c.housing.monthlyRent.oneBed}/mo`} />
              <InfoItem label="2-Bed Rent" value={`$${c.housing.monthlyRent.twoBed}/mo`} />
              <InfoItem label="Hostel" value={`$${c.housing.hostels.average}/night`} />
              <InfoItem label="Budget Hotel" value={`$${c.housing.hotels.budget}/night`} />
              <InfoItem label="Utilities" value={`~$${c.housing.utilities}/mo`} />
              <InfoItem label="Lease Terms" value={c.housing.leaseTerms} />
              <InfoItem label="Deposits" value={c.housing.deposits} />
            </div>
            {c.housing.neighborhoods.length > 0 && (
              <div className="neighborhood-grid">
                {c.housing.neighborhoods.map((n) => (
                  <div key={n.name} className="neighborhood-card card">
                    <strong>{n.name}</strong>
                    <span>${n.avgRent}/mo</span>
                    <p>{n.description}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Transportation */}
          <section id="transportation" className="country-section">
            <h2>Transportation</h2>
            <div className="transport-icons">
              {c.transportation.uber && <span className="chip active">Uber</span>}
              {c.transportation.bolt && <span className="chip active">Bolt</span>}
              {c.transportation.grab && <span className="chip active">Grab</span>}
              {c.transportation.metro && <span className="chip active">Metro</span>}
              {c.transportation.train && <span className="chip active">Train</span>}
              {c.transportation.bus && <span className="chip active">Bus</span>}
              {c.transportation.scooters && <span className="chip active">Scooters</span>}
            </div>
            <div className="info-grid">
              <InfoItem label="IDP Required" value={c.transportation.idpRequired ? 'Yes' : 'No'} />
              <InfoItem label="Rental Car" value={`$${c.transportation.rentalCars.daily}/day`} />
              <InfoItem label="Metro" value={`$${c.transportation.averageCosts.metro}`} />
              <InfoItem label="Taxi" value={`$${c.transportation.averageCosts.taxi}`} />
              <InfoItem label="Bus" value={`$${c.transportation.averageCosts.bus}`} />
            </div>
          </section>

          {/* Healthcare */}
          <section id="healthcare" className="country-section">
            <h2>Healthcare</h2>
            <div className="info-grid">
              <InfoItem label="Emergency" value={c.healthcare.emergencyNumbers.join(', ')} />
              <InfoItem label="Hospitals" value={String(c.healthcare.hospitals)} />
              <InfoItem label="Private Healthcare" value={c.healthcare.privateHealthcare} />
              <InfoItem label="Travel Insurance" value={c.healthcare.travelInsurance} />
              <InfoItem label="English Doctors" value={`${c.healthcare.englishSpeakingDoctors}% availability`} />
            </div>
            {c.healthcare.vaccinations.length > 0 && (
              <ListSection title="Recommended Vaccinations" items={c.healthcare.vaccinations} />
            )}
          </section>

          {/* Safety */}
          <section id="safety" className="country-section">
            <h2>Safety</h2>
            <div className="scores-grid">
              <ScoreBar label="Crime Safety" value={c.safety.crime} />
              <ScoreBar label="Women's Safety" value={c.safety.womensSafety} />
              <ScoreBar label="Political Stability" value={c.safety.politicalStability} />
              <ScoreBar label="Air Quality" value={c.safety.airQuality} />
              <ScoreBar label="Water Quality" value={c.safety.waterQuality} />
            </div>
            <div className="info-grid">
              <InfoItem label="Earthquake Risk" value={c.safety.earthquakeRisk} />
              <InfoItem label="Flood Risk" value={c.safety.floodRisk} />
            </div>
            {c.safety.scams.length > 0 && <ListSection title="Common Scams" items={c.safety.scams} />}
            {c.safety.naturalDisasters.length > 0 && <ListSection title="Natural Disasters" items={c.safety.naturalDisasters} />}
          </section>

          {/* Weather */}
          <section id="weather" className="country-section">
            <h2>Weather</h2>
            <div className="weather-chart">
              {c.weather.monthly.map((m) => (
                <div key={m.month} className="weather-bar" title={`${m.month}: ${m.tempLow}-${m.tempHigh}°C`}>
                  <div className="weather-bar__fill" style={{ height: `${(m.tempHigh / 40) * 100}%` }} />
                  <span className="weather-bar__label">{m.month}</span>
                </div>
              ))}
            </div>
            <div className="info-grid">
              <InfoItem label="Best Months" value={c.weather.bestMonths.join(', ')} />
              <InfoItem label="Worst Months" value={c.weather.worstMonths.join(', ')} />
              {c.weather.monsoon && <InfoItem label="Monsoon" value={c.weather.monsoon} />}
              {c.weather.typhoonSeason && <InfoItem label="Typhoon Season" value={c.weather.typhoonSeason} />}
            </div>
          </section>

          {/* Food */}
          <section id="food" className="country-section">
            <h2>Food</h2>
            <div className="info-grid">
              <InfoItem label="Average Meal" value={`$${c.food.averageMealCost}`} />
              <InfoItem label="Street Food" value={c.food.streetFood ? 'Available' : 'Limited'} />
              <InfoItem label="Delivery Apps" value={c.food.deliveryApps.join(', ')} />
            </div>
            <div className="scores-grid">
              <ScoreBar label="Vegetarian" value={c.food.vegetarian} />
              <ScoreBar label="Vegan" value={c.food.vegan} />
              <ScoreBar label="Halal" value={c.food.halal} />
            </div>
            {c.food.localDishes.length > 0 && (
              <div className="transport-icons">
                {c.food.localDishes.map((d) => <span key={d} className="chip">{d}</span>)}
              </div>
            )}
          </section>

          {/* Banking */}
          <section id="banking" className="country-section">
            <h2>Banking</h2>
            <div className="info-grid">
              <InfoItem label="Foreign Accounts" value={c.banking.foreignAccounts ? 'Possible' : 'Difficult'} />
              <InfoItem label="ATMs" value={c.banking.atms ? 'Widely available' : 'Limited'} />
              <InfoItem label="Cashless Score" value={`${c.banking.cashlessScore}/100`} />
              <InfoItem label="Credit Cards" value={`${c.banking.creditCards}% acceptance`} />
              <InfoItem label="Transfers" value={c.banking.internationalTransfers} />
            </div>
          </section>

          {/* Tax */}
          <section id="tax" className="country-section">
            <h2>Tax Intelligence</h2>
            <div className="info-grid">
              <InfoItem label="183-Day Rule" value={c.tax.dayRule183 ? 'Applies' : 'Does not apply'} />
              <InfoItem label="Tax Residency" value={c.tax.taxResidency} />
              <InfoItem label="Territorial Tax" value={c.tax.territorialTax ? 'Yes' : 'No'} />
              <InfoItem label="Zero Income Tax" value={c.tax.zeroIncomeTax ? 'Yes' : 'No'} />
              {c.tax.nomadTaxProgram && <InfoItem label="Nomad Program" value={c.tax.nomadTaxProgram} />}
            </div>
            {c.tax.doubleTaxTreaties.length > 0 && (
              <ListSection title="Double Tax Treaties" items={c.tax.doubleTaxTreaties} />
            )}
          </section>

          {/* Cost of Living */}
          <section id="cost" className="country-section">
            <h2>Cost of Living</h2>
            <div className="cost-cards">
              <div className="cost-card card">
                <span className="cost-card__label">Budget</span>
                <span className="cost-card__amount">${c.costOfLiving.monthlyBudget.budget}</span>
                <span className="cost-card__period">/month</span>
              </div>
              <div className="cost-card card">
                <span className="cost-card__label">Mid-Range</span>
                <span className="cost-card__amount">${c.costOfLiving.monthlyBudget.mid}</span>
                <span className="cost-card__period">/month</span>
              </div>
              <div className="cost-card card">
                <span className="cost-card__label">Luxury</span>
                <span className="cost-card__amount">${c.costOfLiving.monthlyBudget.luxury}</span>
                <span className="cost-card__period">/month</span>
              </div>
            </div>
            <div className="scores-grid">
              <ScoreBar label="Housing" value={c.costOfLiving.housing} max={2000} />
              <ScoreBar label="Food" value={c.costOfLiving.food} max={800} />
              <ScoreBar label="Transport" value={c.costOfLiving.transportation} max={200} />
              <ScoreBar label="Healthcare" value={c.costOfLiving.healthcare} max={200} />
              <ScoreBar label="Entertainment" value={c.costOfLiving.entertainment} max={500} />
            </div>
          </section>

          <div className="country-cta">
            <Link to="/visa-finder" className="btn btn-primary">Find My Visa</Link>
            <Link to="/cost-calculator" className="btn btn-secondary">Calculate Costs</Link>
            <Link to="/compare" className="btn btn-ghost">Compare Countries</Link>
          </div>
        </div>
      </div>
    </>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="info-item">
      <span className="info-item__label">{label}</span>
      <span className="info-item__value">{value}</span>
    </div>
  );
}

function ListSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="list-section">
      <h3>{title}</h3>
      <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
    </div>
  );
}
