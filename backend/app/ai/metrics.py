import threading
from typing import Dict, Any


class AIMetrics:

    def __init__(self):
        self._lock = threading.Lock()
        self.successful_requests = 0
        self.ollama_failures = 0
        self.validation_failures = 0
        self.total_response_time = 0.0

    def record_success(self, response_time: float):
        """Record a successful request with its response time (latency)."""
        with self._lock:
            self.successful_requests += 1
            self.total_response_time += response_time

    def record_ollama_failure(self):
        """Increment count of failed calls to Ollama."""
        with self._lock:
            self.ollama_failures += 1

    def record_validation_failure(self):
        """Increment count of response validation failures."""
        with self._lock:
            self.validation_failures += 1

    def get_metrics(self) -> Dict[str, Any]:
        """Compile and return current latency and success metrics."""
        with self._lock:
            total_requests = self.successful_requests + self.ollama_failures + self.validation_failures
            avg_latency = 0.0
            if self.successful_requests > 0:
                avg_latency = self.total_response_time / self.successful_requests
            return {
                "successful_requests": self.successful_requests,
                "ollama_failures": self.ollama_failures,
                "validation_failures": self.validation_failures,
                "total_requests": total_requests,
                "total_response_time": self.total_response_time,
                "average_latency": avg_latency
            }


# Exportable singleton instance
metrics_tracker = AIMetrics()
