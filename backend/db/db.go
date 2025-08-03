package db

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

var Pool *pgxpool.Pool

func Connect() error {
	ctx := context.Background()

	config, err := pgxpool.ParseConfig(os.Getenv("DATABASE_URL"))
	if err != nil {
		return fmt.Errorf("unable to parse database config: %w", err)
	}

	config.MaxConns = 10
	config.MinConns = 2
	config.MaxConnLifetime = time.Hour
	config.MaxConnIdleTime = time.Minute
	config.HealthCheckPeriod = time.Minute

	const maxRetries = 10
	var pool *pgxpool.Pool

	for i := 0; i < maxRetries; i++ {
		pool, err = pgxpool.NewWithConfig(ctx, config)
		if err != nil {
			fmt.Printf("Failed to create pool (attempt %d/%d): %v\n", i+1, maxRetries, err)
			time.Sleep(1 * time.Second)
			continue
		}

		err = pool.Ping(ctx)
		if err != nil {
			fmt.Printf("Database ping failed (attempt %d/%d): %v\n", i+1, maxRetries, err)
			pool.Close()
			time.Sleep(1 * time.Second)
			continue
		}

		Pool = pool
		fmt.Println("Successfully connected to database pool")
		return nil
	}

	return fmt.Errorf("failed to connect to database after %d attempts: %w", maxRetries, err)
}

func Close() {
	if Pool != nil {
		Pool.Close()
	}
}
