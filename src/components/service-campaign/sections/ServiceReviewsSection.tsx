import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Campaign {
  id: string;
  title: string;
}

interface ServiceReviewsSectionProps {
  campaign: Campaign;
}

// Mock data for now - would come from database in production
const mockReviews = [
  {
    id: 1,
    author: "Sarah M.",
    avatar: null,
    rating: 5,
    date: "2 weeks ago",
    comment: "Absolutely amazing work! The beat was exactly what I was looking for and the turnaround time was super fast. Highly recommend!",
    verified: true
  },
  {
    id: 2,
    author: "Marcus J.",
    avatar: null,
    rating: 5,
    date: "1 month ago",
    comment: "Professional quality and great communication throughout. Will definitely work with again!",
    verified: true
  },
  {
    id: 3,
    author: "Alex K.",
    avatar: null,
    rating: 4,
    date: "2 months ago",
    comment: "Really good beat, minor revisions needed but overall very happy with the result.",
    verified: false
  }
];

export function ServiceReviewsSection({ campaign }: ServiceReviewsSectionProps) {
  const averageRating = 4.9;
  const totalReviews = 12;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-3xl font-bold mb-2">Reviews & Ratings</h2>
        <p className="text-muted-foreground">
          See what others are saying about this service
        </p>
      </div>

      {/* Rating Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">{averageRating}</div>
              <div className="flex items-center gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(averageRating)
                        ? "fill-yellow-500 text-yellow-500"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">{totalReviews} reviews</p>
            </div>

            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => (
                <div key={stars} className="flex items-center gap-3">
                  <span className="text-sm w-12">{stars} star</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500"
                      style={{
                        width: `${stars === 5 ? 80 : stars === 4 ? 15 : 5}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8">
                    {stars === 5 ? 10 : stars === 4 ? 2 : 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Reviews */}
      <div className="space-y-4">
        {mockReviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Avatar>
                  <AvatarImage src={review.avatar || undefined} />
                  <AvatarFallback>{review.author.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{review.author}</h4>
                    {review.verified && (
                      <Badge variant="secondary" className="text-xs">
                        Verified
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating
                              ? "fill-yellow-500 text-yellow-500"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">{review.date}</span>
                  </div>

                  <p className="text-muted-foreground">{review.comment}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {totalReviews > mockReviews.length && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">
              Showing {mockReviews.length} of {totalReviews} reviews
            </p>
            <button className="text-primary hover:underline">
              Load More Reviews
            </button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
