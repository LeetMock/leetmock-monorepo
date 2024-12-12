from livekit.agents.tts import TTS
from livekit.plugins import elevenlabs, openai


def get_tts_engine(voice: str) -> TTS:
    if voice == "brian":
        return create_elevenlabs_tts()
    elif voice == "alloy":
        return create_openai_tts()
    else:
        raise ValueError(f"Invalid voice: {voice}")


def create_elevenlabs_tts() -> elevenlabs.TTS:
    return elevenlabs.TTS(
        model_id="eleven_multilingual_v2",
        voice=elevenlabs.Voice(
            id="UgBBYS2sOqTuMpoF3BR0",
            name="Mark - Natural Conversations",
            category="cloned",
            settings=elevenlabs.VoiceSettings(
                stability=0.3,
                similarity_boost=0.5,
                style=0.5,
                use_speaker_boost=True,
            ),
        ),
    )


def create_openai_tts() -> openai.TTS:
    return openai.TTS()
