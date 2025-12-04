import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function CallToAction() {
    return (
        <section className="py-16">
            <div className="mx-auto max-w-6xl rounded-3xl border px-6 py-12 md:py-20 lg:py-32">
                <div className="text-center">
                    <h2 className="text-balance text-4xl font-semibold lg:text-5xl">Rejoignez la communauté</h2>
                    <p className="mt-4">Connectez-vous avec des développeurs, designers et contributeurs passionnés par le développement open source en RDC.</p>

                    <div className="mt-12 flex flex-wrap justify-center gap-4">
                        <Button
                            asChild
                            size="lg"
                            variant="rdc">
                            <Link href="/">
                                <span>Soumettre un projet</span>
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}
