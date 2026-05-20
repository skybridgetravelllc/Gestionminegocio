import { useState } from 'react';
import { Search, Hotel as HotelIcon, MapPin, Star, Users, Loader } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { RAPIDAPI_KEY } from '../lib/supabase';

interface HotelResult {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviews: number;
  price: number;
  currency: string;
  image?: string;
  amenities: string[];
}

export function Hotels() {
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    destination: '',
    checkIn: '',
    checkOut: '',
    adults: '2',
    rooms: '1',
  });
  const [results, setResults] = useState<HotelResult[]>([]);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!searchParams.destination || !searchParams.checkIn || !searchParams.checkOut) {
      setError('Por favor complete todos los campos requeridos');
      return;
    }

    setLoading(true);
    setError('');
    setResults([]);

    try {
      const response = await fetch(
        `https://booking-com15.p.rapidapi.com/api/v1/hotels/searchHotels?dest_id=${encodeURIComponent(searchParams.destination)}&search_type=CITY&arrival_date=${searchParams.checkIn}&departure_date=${searchParams.checkOut}&adults=${searchParams.adults}&room_qty=${searchParams.rooms}&page_number=1&units=metric&temperature_unit=c&languagecode=en-us&currency_code=USD`,
        {
          method: 'GET',
          headers: {
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': 'booking-com15.p.rapidapi.com',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Error al buscar hoteles');
      }

      const data = await response.json();

      if (data.data?.hotels) {
        const hotels: HotelResult[] = data.data.hotels.map((hotel: any) => ({
          id: hotel.hotel_id || Math.random().toString(),
          name: hotel.property?.name || 'Hotel',
          address: hotel.property?.address || searchParams.destination,
          rating: hotel.property?.reviewScore || 0,
          reviews: hotel.property?.reviewCount || 0,
          price: hotel.property?.priceBreakdown?.grossPrice?.value || 0,
          currency: hotel.property?.priceBreakdown?.grossPrice?.currency || 'USD',
          image: hotel.property?.photoUrls?.[0],
          amenities: hotel.property?.amenities || [],
        }));
        setResults(hotels);
      } else {
        setError('No se encontraron hoteles para esta búsqueda');
      }
    } catch (err: any) {
      console.error('Hotel search error:', err);
      setError(err.message || 'Error al buscar hoteles. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Búsqueda de Hoteles</h1>
        <p className="text-gray-600 mt-1">
          Encuentra el alojamiento perfecto para tus clientes
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-3 space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Destino
            </label>
            <Input
              placeholder="Ciudad o destino"
              value={searchParams.destination}
              onChange={(e) =>
                setSearchParams({ ...searchParams, destination: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Check-in
            </label>
            <Input
              type="date"
              value={searchParams.checkIn}
              onChange={(e) =>
                setSearchParams({ ...searchParams, checkIn: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Check-out
            </label>
            <Input
              type="date"
              value={searchParams.checkOut}
              onChange={(e) =>
                setSearchParams({ ...searchParams, checkOut: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Adultos
            </label>
            <Input
              type="number"
              min="1"
              max="10"
              value={searchParams.adults}
              onChange={(e) =>
                setSearchParams({ ...searchParams, adults: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Habitaciones
            </label>
            <Input
              type="number"
              min="1"
              max="5"
              value={searchParams.rooms}
              onChange={(e) =>
                setSearchParams({ ...searchParams, rooms: e.target.value })
              }
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSearch} disabled={loading} className="px-8">
            {loading ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Buscando...
              </>
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" />
                Buscar Hoteles
              </>
            )}
          </Button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Resultados ({results.length})
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {results.map((hotel) => (
              <div
                key={hotel.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {hotel.image && (
                  <img
                    src={hotel.image}
                    alt={hotel.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {hotel.name}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        {hotel.address}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 mb-4">
                    {hotel.rating > 0 && (
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-semibold text-gray-900">
                          {hotel.rating.toFixed(1)}
                        </span>
                        <span className="text-sm text-gray-600">
                          ({hotel.reviews} reseñas)
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-sm text-gray-600">Precio por noche</p>
                      <p className="text-2xl font-bold text-blue-600">
                        ${hotel.price.toLocaleString()} {hotel.currency}
                      </p>
                    </div>
                    <Button size="sm">Ver Detalles</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )}
    </div>
  );
}
