import { useState } from 'react';
import { Search, Plane, Calendar, Users, Loader } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { RAPIDAPI_KEY } from '../lib/supabase';

interface FlightResult {
  id: string;
  airline: string;
  flightNumber: string;
  departure: {
    airport: string;
    time: string;
    date: string;
  };
  arrival: {
    airport: string;
    time: string;
    date: string;
  };
  duration: string;
  price: number;
  class: string;
}

export function Flights() {
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    passengers: '1',
    class: 'economy',
  });
  const [results, setResults] = useState<FlightResult[]>([]);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!searchParams.origin || !searchParams.destination || !searchParams.departureDate) {
      setError('Por favor complete todos los campos requeridos');
      return;
    }

    setLoading(true);
    setError('');
    setResults([]);

    try {
      const response = await fetch(
        'https://sky-scrapper.p.rapidapi.com/api/v2/flights/searchFlightsComplete',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': 'sky-scrapper.p.rapidapi.com',
          },
          body: JSON.stringify({
            originSkyId: searchParams.origin,
            destinationSkyId: searchParams.destination,
            originEntityId: searchParams.origin,
            destinationEntityId: searchParams.destination,
            date: searchParams.departureDate,
            returnDate: searchParams.returnDate || undefined,
            cabinClass: searchParams.class,
            adults: parseInt(searchParams.passengers),
            currency: 'USD',
            market: 'en-US',
            countryCode: 'US',
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Error al buscar vuelos');
      }

      const data = await response.json();

      if (data.data?.itineraries) {
        const flights: FlightResult[] = data.data.itineraries.map(
          (itinerary: any, index: number) => ({
            id: `flight-${index}`,
            airline: itinerary.legs?.[0]?.carriers?.marketing?.[0]?.name || 'Aerolínea',
            flightNumber:
              itinerary.legs?.[0]?.segments?.[0]?.flightNumber || 'N/A',
            departure: {
              airport:
                itinerary.legs?.[0]?.origin?.displayCode || searchParams.origin,
              time: itinerary.legs?.[0]?.departure || '',
              date: searchParams.departureDate,
            },
            arrival: {
              airport:
                itinerary.legs?.[0]?.destination?.displayCode ||
                searchParams.destination,
              time: itinerary.legs?.[0]?.arrival || '',
              date: searchParams.departureDate,
            },
            duration: itinerary.legs?.[0]?.durationInMinutes
              ? `${Math.floor(itinerary.legs[0].durationInMinutes / 60)}h ${itinerary.legs[0].durationInMinutes % 60}m`
              : 'N/A',
            price: itinerary.price?.raw || 0,
            class: searchParams.class,
          })
        );
        setResults(flights);
      } else {
        setError('No se encontraron vuelos para esta búsqueda');
      }
    } catch (err: any) {
      console.error('Flight search error:', err);
      setError(err.message || 'Error al buscar vuelos. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Búsqueda de Vuelos</h1>
        <p className="text-gray-600 mt-1">
          Encuentra los mejores vuelos para tus clientes
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Origen</label>
            <Input
              placeholder="Código IATA (ej: JFK)"
              value={searchParams.origin}
              onChange={(e) =>
                setSearchParams({ ...searchParams, origin: e.target.value.toUpperCase() })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Destino
            </label>
            <Input
              placeholder="Código IATA (ej: LAX)"
              value={searchParams.destination}
              onChange={(e) =>
                setSearchParams({
                  ...searchParams,
                  destination: e.target.value.toUpperCase(),
                })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Fecha de Salida
            </label>
            <Input
              type="date"
              value={searchParams.departureDate}
              onChange={(e) =>
                setSearchParams({ ...searchParams, departureDate: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Fecha de Regreso (opcional)
            </label>
            <Input
              type="date"
              value={searchParams.returnDate}
              onChange={(e) =>
                setSearchParams({ ...searchParams, returnDate: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Pasajeros
            </label>
            <Input
              type="number"
              min="1"
              max="9"
              value={searchParams.passengers}
              onChange={(e) =>
                setSearchParams({ ...searchParams, passengers: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Clase</label>
            <select
              value={searchParams.class}
              onChange={(e) =>
                setSearchParams({ ...searchParams, class: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="economy">Económica</option>
              <option value="premium_economy">Premium Economy</option>
              <option value="business">Ejecutiva</option>
              <option value="first">Primera Clase</option>
            </select>
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
                Buscar Vuelos
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
          {results.map((flight) => (
            <div
              key={flight.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Plane className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {flight.airline}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Vuelo {flight.flightNumber}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Salida</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {flight.departure.airport}
                      </p>
                      <p className="text-sm text-gray-600">
                        {flight.departure.time
                          ? new Date(flight.departure.time).toLocaleTimeString(
                              'es-ES',
                              {
                                hour: '2-digit',
                                minute: '2-digit',
                              }
                            )
                          : 'Por confirmar'}
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-gray-600">Duración</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {flight.duration}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-600">Llegada</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {flight.arrival.airport}
                      </p>
                      <p className="text-sm text-gray-600">
                        {flight.arrival.time
                          ? new Date(flight.arrival.time).toLocaleTimeString(
                              'es-ES',
                              {
                                hour: '2-digit',
                                minute: '2-digit',
                              }
                            )
                          : 'Por confirmar'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="ml-8 text-right">
                  <p className="text-3xl font-bold text-blue-600">
                    ${flight.price.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-1 capitalize">
                    {flight.class}
                  </p>
                  <Button className="mt-4" size="sm">
                    Reservar
                  </Button>
                </div>
              </div>
            </div>
          ))}
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
