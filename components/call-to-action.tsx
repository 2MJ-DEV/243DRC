import { Button } from '@/components/ui/button'
import { Send, SendHorizonal } from 'lucide-react'
import Link from 'next/link'

export default function CallToAction() {
    return (
        <section className="py-16 px-4 sm:px-6">
            <div className="mx-auto max-w-6xl rounded-3xl border px-6 py-12 md:py-20 lg:py-32 relative overflow-hidden bg-gradient-to-br from-[#007FFF]/5 via-background to-[#EFDA5B]/5">
                {/* Orbes décoratifs */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#007FFF]/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#EFDA5B]/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#CA3E4B]/5 rounded-full blur-3xl"></div>
                
                {/* Motif de points */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }}></div>
                
                <div className="text-center relative z-10">
                    <div className="inline-block mb-4">
                        <div className="flex gap-2 items-center">
                            <span className="w-3 h-3 rounded-full bg-[#007FFF] animate-pulse"></span>
                            <span className="w-3 h-3 rounded-full bg-[#EFDA5B] animate-pulse" style={{animationDelay: '0.2s'}}></span>
                            <span className="w-3 h-3 rounded-full bg-[#CA3E4B] animate-pulse" style={{animationDelay: '0.4s'}}></span>
                        </div>
                    </div>
                    
                    <h2 className="text-balance text-4xl font-semibold lg:text-5xl bg-clip-text">
                        Rejoignez la communauté
                    </h2>
                    <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                        Connectez-vous avec des développeurs, designers et contributeurs passionnés par le développement open source en RDC.
                    </p>

                    <div className="mt-12 flex flex-wrap justify-center gap-4">
                        <Button
                            asChild
                            size="lg"
                            variant="rdc"
                            className="shadow-lg hover:shadow-xl transition-shadow">
                            <Link href="/u/dashboard/ajouter-projet">
                                <span>Soumettre un projet</span>
                                <SendHorizonal size="30" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}
