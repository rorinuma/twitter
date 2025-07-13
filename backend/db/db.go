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


	Pool, err = pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		return fmt.Errorf("unable to create connection pool: %w", err)
	}


	if err := Pool.Ping(ctx); err != nil {
		return fmt.Errorf("database ping failed: %w", err)
	}

	fmt.Println("Successfully connected to database pool")
	return nil
}

// Add this to close the pool when your application shuts down
func Close() {
	if Pool != nil {
		Pool.Close()
	}
}
