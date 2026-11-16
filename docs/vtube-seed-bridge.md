# DryWriter ↔ VTube Seed Factory Bridge

## Purpose
Use Analyzer/YouTube seeds, VTube persona/media assets, and DryWriter's situation-dialogue-conflict engine as one production pipeline.

## Input contract
- SOURCE_SEED_IDS
- PERSONA_ID
- STORY_PATTERN
- AUDIENCE_NEED
- PLACE_ID / ENVIRONMENT_ASSET_ID
- IMAGE_ASSET_IDS / VIDEO_ASSET_IDS / MOTION_PLATE_IDS
- CAMERA_GRAMMAR
- LANGUAGE / TTS_STYLE / SUBTITLE_STYLE

## DryWriter transformation
1. Situation: concrete place, time, relationship, goal.
2. Dialogue: natural dialogue first; avoid lecture/sermon tone.
3. Conflict: small friction, surprise, misunderstanding, choice or emotional turn.
4. Resolution: not a moral summary; end with lingering image, choice, or question.
5. Reuse: preserve SOURCE_SEED_IDS and do not copy source wording verbatim.

## Output contract
- OUTPUT_STORY_ID
- PERSONA_ID
- STORYBOARD_ID
- SCENE_BEATS
- DIALOGUE_BEATS
- EMOTION_ARC
- CTA_OR_ENDING
- SOURCE_SEED_IDS
- RIGHTS_USAGE
- VERIFIED_STATUS

## Routing
QUEENS → Analyzer → Seed Library → VTube Persona/Media Seed → DryWriter Bridge → Storyboard_Seed → Scene_Template → VTube production.
