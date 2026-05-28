import { LyricSection } from '@/app/types';


interface ILyricsShowProps {
    section: LyricSection
}

const LyricsShow = ({ section }: ILyricsShowProps) => {
    return (
        <div className="px-5 py-3 md:px-8 md:py-10">
            <div className="space-y-2">
                {section.lines?.map((line, index) => {
                    const chord = section.chords?.[index]?.[0];

                    return (
                        <div
                            key={index}
                            className="group relative rounded-2xl border border-transparent p-4 transition-all duration-300 hover:border-primary/20 hover:bg-primary/[0.03]"
                        >


                            {/* CHORD */}
                            {chord && (
                                <div className="mb-2 inline-flex items-center rounded-xl border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-bold tracking-wide text-primary shadow-sm">
                                    ♪ {chord}
                                </div>
                            )}

                            {/* LYRIC */}
                            <p className="text-xl leading-[2.2rem] tracking-wide text-foreground md:text-2xl">
                                {line}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    )
}

export default LyricsShow