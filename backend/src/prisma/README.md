# Database Seed

## Quick Commands

```bash
# Generate Prisma Client (do this first!)
npx prisma generate

# Run seed
npm run prisma:seed

# View data
npm run prisma:studio

# Reset & re-seed
npx prisma migrate reset
```

## What Gets Created

- 1 Organization (VolleyCoaching Demo Club)
- 3 Users (admin@volleycoaching.com, coach1@, coach2@ - password: Demo123!)
- 2 Teams (Elite Squad: 7 players, Junior Team: 5 players)
- 12 Players (NO initial stats)
- 17 Evaluations (12 first + 5 second) via EvaluationService
- 20 Exercises with 10 tags
- 3 Training sessions (completed)
- 60 Performance metrics
- 2 Development plans

## Architecture

Players are created WITHOUT stats. The EvaluationService fills them:

1. **First evaluation** → 100% copy to Player
2. **Second evaluation** → 30% new + 70% existing blend

All evaluations include complete technical/physical/mental structures matching `EvaluationStructures.types.ts`.

## Documentation

See `/mnt/g/VolleyCoaching/SEED_COMPLETE.md` for full details.
