from livekit.agents.tts import TTS
from livekit.plugins import elevenlabs, openai, cartesia



def get_tts_engine(voice="male") -> TTS:

    return create_cartesia_tts(voice)
    # if voice == "alex":
    #     return create_elevenlabs_tts()
    # elif voice == "alloy":
    #     return create_openai_tts()
    # else:
    #     raise ValueError(f"Invalid voice: {voice}")



def create_elevenlabs_tts() -> elevenlabs.TTS:
    return elevenlabs.TTS(
        model_id="eleven_multilingual_v2",
        voice=elevenlabs.Voice(
            id="UgBBYS2sOqTuMpoF3BR0",
            name="Mark - Natural Conversations",
            category="professional",
            settings=elevenlabs.VoiceSettings(
                stability=0.25,
                similarity_boost=0.5,
                style=0.3,
                use_speaker_boost=True,
            ),
        ),
    )

def create_cartesia_tts(voice: str) -> cartesia.TTS:

    if voice == "male":
        voice_id = "87bc56aa-ab01-4baa-9071-77d497064686"
    elif voice == "female":
        voice_id = "794f9389-aac1-45b6-b726-9d9369183238"
    else:
        voice_id = "87bc56aa-ab01-4baa-9071-77d497064686"

    return cartesia.TTS(
        model="sonic",
        voice=voice_id,
        speed=0.1,
        emotion=["curiosity:highest", "positivity:high"]
    )


def create_openai_tts() -> openai.TTS:
    return openai.TTS()
