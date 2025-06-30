FROM ubuntu:22.04

# Install development tools (add more as needed)
RUN apt-get update && \
    apt-get install -y \
    git \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user and set workdir
RUN useradd -ms /bin/bash ubuntu
USER ubuntu
WORKDIR /home/ubuntu
