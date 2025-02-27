import React from 'react'

const Flyer: React.FC = () => {

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <header className="text-center mb-8">
                <h1 className="text-4xl font-bold text-green-800 mb-4">Masai Mara Flying Safari</h1>
                <h2 className="text-2xl font-semibold text-green-600">05 DAYS</h2>
            </header>

            <section className="bg-white shadow-lg rounded-lg p-6 mb-8">
                <h3 className="text-xl font-bold text-green-700 border-b-2 border-green-200 pb-2 mb-4">Safari Description</h3>
                <p className="text-gray-700 leading-relaxed">
                    {`Experience the best of Kenya's wildlife on a 5-day safari adventure in the world-renowned Masai Mara. Start your journey with a relaxing stay in Nairobi at the Radisson Blu Hotel and Residence, Nairobi Arboretum. Then, fly to the Masai Mara National Reserve, where you'll stay at the luxurious AndBeyond Kichwa Tembo Tented Camp. Spend your days exploring the vast savannahs, witnessing the spectacular wildlife, including the Big Five and the Great Migration. This short but unforgettable safari offers the perfect blend of luxury, adventure, and breathtaking natural beauty.`}
                </p>
            </section>

            <section className="bg-white shadow-lg rounded-lg p-6 mb-8">
                <h3 className="text-xl font-bold text-green-700 border-b-2 border-green-200 pb-2 mb-4">Itinerary Overview</h3>
                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-green-600">Day 1: Arrive in Nairobi</h4>
                        <ul className="list-disc list-inside pl-4">
                            <li>Arrival at Jomo Kenyatta International Airport</li>
                            <li>Transfer to Radisson Blu Hotel and Residence, Nairobi Arboretum</li>
                            <li>Lunch, leisure, dinner, and overnight stay at the hotel</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-green-600">Day 2: Nairobi to Masai Mara National Reserve</h4>
                        <ul className="list-disc list-inside pl-4">
                            <li>Fly to Masai Mara National Reserve</li>
                            <li>Afternoon game drive and overnight at AndBeyond Kichwa Tembo Tented Camp</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-green-600">Days 3-4: Masai Mara National Reserve</h4>
                        <ul className="list-disc list-inside pl-4">
                            <li>Full days of game viewing in the Masai Mara</li>
                            <li>Overnight at AndBeyond Kichwa Tembo Tented Camp</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-green-600">Day 5: Departure</h4>
                        <ul className="list-disc list-inside pl-4">
                            <li>Fly back to Nairobi</li>
                            <li>Lunch at Crowne Plaza Nairobi Airport</li>
                            <li>Transfer to the departure terminal</li>
                            <li>End of Safari</li>
                        </ul>
                    </div>
                </div>
            </section>

            <section className="bg-white shadow-lg rounded-lg p-6 mb-8">
                <h3 className="text-xl font-bold text-green-700 border-b-2 border-green-200 pb-2 mb-4">Inclusions & Exclusions</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-semibold text-green-600 mb-2">Included in the safari:</h4>
                        <ul className="list-disc list-inside pl-4 space-y-2">
                            <li>Meet and greet services on arrival</li>
                            <li>Private airport transfers</li>
                            <li>Transport in a six-seater 4x4 safari Land Cruiser</li>
                            <li>Professional English-speaking driver guide</li>
                            <li>Park and reserve entrance fees</li>
                            <li>Game drives as indicated</li>
                            <li>1 Night at Radisson Blu Hotel (Half board)</li>
                            <li>3 Nights at AndBeyond Kichwa Tembo Tented Camp (Full board)</li>
                            <li>Scheduled flights Nairobi/Masai Mara</li>
                            <li>Flying Doctors temporary membership</li>
                            <li>All government taxes and levies</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-red-600 mb-2">Excluded:</h4>
                        <ul className="list-disc list-inside pl-4 space-y-2">
                            <li>International airfare and related taxes</li>
                            <li>Kenya e-Visa</li>
                            <li>Meals not specified</li>
                            <li>Personal expenses</li>
                            <li>Drinks</li>
                            <li>Travel and medical insurance</li>
                            <li>Tips and gratuities</li>
                            <li>Any deviations from the main programme</li>
                        </ul>
                    </div>
                </div>
            </section>

            <footer className="text-center text-gray-600 mt-8">
                <p>© 2024 Masai Mara Safari Experience</p>
            </footer>
        </div>
    )

}

export default Flyer