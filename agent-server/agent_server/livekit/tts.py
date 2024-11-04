from livekit.plugins import elevenlabs


def create_elevenlabs_tts() -> elevenlabs.TTS:
    return elevenlabs.TTS(
        model_id="eleven_multilingual_v2",
        voice=elevenlabs.Voice(
            id="DaWkexxdbjoJ99NpkRGF",
            name="brian-optimized",
            category="cloned",
            settings=elevenlabs.VoiceSettings(
                stability=0.3,
                similarity_boost=0.5,
                style=0.5,
                use_speaker_boost=True,
            ),
        ),
    )
