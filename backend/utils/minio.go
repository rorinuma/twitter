package utils

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

var MinioClient *minio.Client

func InitMinio() error {
	endpoint := os.Getenv("MINIO_ENDPOINT")
	accessKeyID := os.Getenv("MINIO_ACCESS_KEY")
	secretAccessKey := os.Getenv("MINIO_SECRET_KEY")
	useSSL := false

	client, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKeyID, secretAccessKey, ""),
		Secure: useSSL,
	})
	if err != nil {
		log.Fatalln("Failed to connect to MinIO:", err)
	}

	MinioClient = client

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	buckets := []string{"tweets", "avatars", "banners"}
	location := "us-east-1"

	for _, bucket := range buckets {
		err := MinioClient.MakeBucket(ctx, bucket, minio.MakeBucketOptions{Region: location})
		if err != nil {
			exists, errBucketExists := MinioClient.BucketExists(ctx, bucket)
			if errBucketExists == nil && exists {
				log.Printf("Bucket %s already exists", bucket)
			} else {
				log.Fatalf("Failed to create bucket %s: %v", bucket, err)
			}
		}

		policy := `{
			"Version": "2012-10-17",
			"Statement": [
				{
					"Effect": "Allow",
					"Principal": "*",
					"Action": ["s3:GetObject"],
					"Resource": ["arn:aws:s3:::` + bucket + `/*"]
				}
			]
		}`

		err = MinioClient.SetBucketPolicy(ctx, bucket, policy)
		if err != nil {
			log.Printf("Warning: Failed to set bucket policy for %s (public access might not work): %v", bucket, err)
		}
	}

	log.Println("MinIO setup completed")
	return nil
}
